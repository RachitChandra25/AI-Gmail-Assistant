document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("uploadBtn");
    const clearBtn = document.getElementById("clearBtn");
    const fileInput = document.getElementById("pdfFile");
    const statusDiv = document.getElementById("status");
    const documentContainer = document.getElementById("documentContainer");

    async function fetchDocuments() {
        try {
            const response = await fetch("http://localhost:5000/api/kb/documents");
            const data = await response.json();
            
            if (data.documents.length === 0) {
                documentContainer.innerHTML = '<span style="color: #5f6368; font-size: 14px;">No documents uploaded.</span>';
                return;
            }

            documentContainer.innerHTML = "";
            data.documents.forEach(doc => {
                const item = document.createElement("div");
                item.className = "doc-item";
                
                const name = document.createElement("span");
                name.textContent = doc.filename;
                
                const delBtn = document.createElement("button");
                delBtn.textContent = "Delete";
                delBtn.onclick = () => deleteDocument(doc.id);
                
                item.appendChild(name);
                item.appendChild(delBtn);
                documentContainer.appendChild(item);
            });
        } catch (error) {
            documentContainer.innerHTML = '<span style="color: #d93025; font-size: 14px;">Failed to load documents.</span>';
        }
    }

    async function deleteDocument(id) {
        try {
            const response = await fetch(`http://localhost:5000/api/kb/documents/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                fetchDocuments();
                statusDiv.textContent = "Document deleted.";
                statusDiv.style.color = "#1e8e3e";
            }
        } catch (error) {
            statusDiv.textContent = "Failed to delete document.";
            statusDiv.style.color = "#d93025";
        }
    }

    uploadBtn.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            statusDiv.textContent = "Please select a PDF file first.";
            statusDiv.style.color = "#d93025";
            return;
        }

        statusDiv.textContent = "Processing and extracting AI embeddings... Please wait.";
        statusDiv.style.color = "#1a73e8";
        uploadBtn.disabled = true;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:5000/api/kb/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                statusDiv.textContent = `Success! ${result.message} (${result.chunks} text chunks indexed).`;
                statusDiv.style.color = "#1e8e3e";
                fileInput.value = "";
                fetchDocuments();
            } else {
                statusDiv.textContent = `Error: ${result.error}`;
                statusDiv.style.color = "#d93025";
            }
        } catch (error) {
            statusDiv.textContent = "Failed to connect to backend server. Make sure it is running on port 5000.";
            statusDiv.style.color = "#d93025";
        } finally {
            uploadBtn.disabled = false;
        }
    });

    clearBtn.addEventListener("click", async () => {
        if(!confirm("Are you sure you want to clear the entire knowledge base?")) return;
        
        try {
            const response = await fetch("http://localhost:5000/api/kb/clear", {
                method: "DELETE"
            });
            const result = await response.json();
            if (response.ok) {
                statusDiv.textContent = "Knowledge base successfully cleared.";
                statusDiv.style.color = "#1e8e3e";
                fetchDocuments();
            }
        } catch (error) {
            statusDiv.textContent = "Failed to clear knowledge base. Is the server running?";
            statusDiv.style.color = "#d93025";
        }
    });

    // Fetch documents on initial load
    fetchDocuments();
});
