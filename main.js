let folderCounter = 0;
let fileCounter = 0;
let folders = {};

const logAction = (action, details) => {
    fetch('http://localhost:3000/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, details, timestamp: new Date().toISOString() })
    }).then(response => {
        if (!response.ok) {
            console.error('Error al enviar el log');
        }
    }).catch(error => {
        console.error('Error en la solicitud de log:', error);
    });
};

const crearCarpeta = () => {
    folderCounter++;
    const folderName = `Carpeta ${folderCounter}`;
    folders[folderName] = [];
    const carpetaDiv = document.createElement('div');
    carpetaDiv.className = 'carpeta';
    carpetaDiv.innerHTML = `
        <div class="folder-title" ondblclick="renombrarCarpeta(this, '${folderName}')">${folderName}</div>
        <button onclick="crearArchivo('${folderName}')">Crear Archivo</button>
        <div id="archivos_${folderCounter}"></div>
    `;
    document.getElementById('carpetas').appendChild(carpetaDiv);
    logAction('crearCarpeta', { folderName });
};

const crearArchivo = (folderName) => {
    fileCounter++;
    const fileId = `archivo_${fileCounter}`;
    const fileName = `Archivo ${fileCounter}`;
    folders[folderName].push({ id: fileId, name: fileName });
    const archivoDiv = document.createElement('div');
    archivoDiv.className = 'archivo';
    archivoDiv.innerHTML = `
        <span class="archivo-name" ondblclick="renombrarArchivo(this, '${folderName}', '${fileId}')">${fileName}</span>
    `;
    archivoDiv.onclick = () => openTab(fileId, fileName);
    document.querySelector(`#archivos_${folderName.split(' ')[1]}`).appendChild(archivoDiv);

    const tabPane = document.createElement('div');
    tabPane.id = fileId;
    tabPane.className = 'tab-pane';
    tabPane.innerHTML = `
        <textarea id="texto_ingresado_${fileId}" onkeyup="actualizar('${fileId}')" class="texto_ingresado" placeholder="Escribe tu código aquí"></textarea>
        <iframe class="editor" id="editor_${fileId}" srcdoc="Resultados aquí"></iframe>
    `;
    document.getElementById('tab-content').appendChild(tabPane);
    logAction('crearArchivo', { folderName, fileName });
};

const actualizar = (fileId) => {
    const texto_ingresado = document.getElementById(`texto_ingresado_${fileId}`);
    const editor = document.getElementById(`editor_${fileId}`);
    editor.srcdoc = texto_ingresado.value;
    logAction('actualizar', { fileId, content: texto_ingresado.value });
};

const openTab = (fileId) => {
    const tabPanes = document.getElementsByClassName('tab-pane');
    for (let i = 0; i < tabPanes.length; i++) {
        tabPanes[i].style.display = "none";
    }
    document.getElementById(fileId).style.display = "flex";
    logAction('openTab', { fileId });
};

const renombrarCarpeta = (element, oldName) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldName;
    input.onblur = () => {
        const newName = input.value.trim();
        if (newName && newName !== oldName) {
            folders[newName] = folders[oldName];
            delete folders[oldName];
            element.textContent = newName;
            logAction('renombrarCarpeta', { oldName, newName });
        }
        element.removeChild(input);
    };
    element.textContent = '';
    element.appendChild(input);
    input.focus();
};

const renombrarArchivo = (element, folderName, fileId) => {
    const oldName = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldName;
    input.onblur = () => {
        const newName = input.value.trim();
        if (newName && newName !== oldName) {
            const folder = folders[folderName];
            const file = folder.find(file => file.id === fileId);
            file.name = newName;
            element.textContent = newName;
            logAction('renombrarArchivo', { folderName, oldName, newName });
        }
        element.removeChild(input);
    };
    element.textContent = '';
    element.appendChild(input);
    input.focus();
};

const descargarArchivos = () => {
    const zip = new JSZip();
    for (const folderName in folders) {
        const folder = zip.folder(folderName);
        folders[folderName].forEach(file => {
            const content = document.getElementById(`texto_ingresado_${file.id}`).value;
            folder.file(`${file.name}.txt`, content);
        });
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "archivos.zip");
        logAction('descargarArchivos', { success: true });
    }).catch(error => {
        console.error('Error al generar el zip:', error);
        logAction('descargarArchivos', { success: false, error });
    });
};
