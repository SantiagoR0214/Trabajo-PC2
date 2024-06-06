let folderCounter = 0;
let fileCounter = 0;
let folders = {};

const crearCarpeta = () => {
    folderCounter++;
    const folderName = `Carpeta ${folderCounter}`;
    folders[folderName] = [];
    const carpetaDiv = document.createElement('div');
    carpetaDiv.className = 'carpeta';
    carpetaDiv.innerHTML = `
        <div class="folder-title">${folderName}</div>
        <button onclick="crearArchivo('${folderName}')">Crear Archivo</button>
        <div id="archivos_${folderCounter}"></div>
    `;
    document.getElementById('carpetas').appendChild(carpetaDiv);
};

const crearArchivo = (folderName) => {
    fileCounter++;
    const fileId = `archivo_${fileCounter}`;
    const fileName = `Archivo ${fileCounter}`;
    folders[folderName].push({ id: fileId, name: fileName });
    const archivoDiv = document.createElement('div');
    archivoDiv.className = 'archivo';
    archivoDiv.textContent = fileName;
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
};

const actualizar = (fileId) => {
    const texto_ingresado = document.getElementById(`texto_ingresado_${fileId}`);
    const editor = document.getElementById(`editor_${fileId}`);
    editor.srcdoc = texto_ingresado.value;
};

const openTab = (fileId) => {
    const tabPanes = document.getElementsByClassName('tab-pane');
    for (let i = 0; i < tabPanes.length; i++) {
        tabPanes[i].style.display = "none";
    }
    document.getElementById(fileId).style.display = "flex";
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
    });
};
