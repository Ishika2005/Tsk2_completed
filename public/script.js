document.addEventListener("DOMContentLoaded", function() {
    const inpFile = document.getElementById("inpFile");
    const btnUpload = document.getElementById("btnUpload");
    const resultText = document.getElementById("resultText");

    btnUpload.addEventListener("click", handleUpload);

    async function handleUpload() {
        if (!inpFile.files || inpFile.files.length === 0) {
            resultText.textContent = "Please select a PDF file.";
            return;
        }

        const formData = new FormData();
        formData.append("pdfFile", inpFile.files[0]);

        try {
            const response = await fetch("/extract-data", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const extractedData = await response.json();
                resultText.textContent = JSON.stringify(extractedData, null, 2);
            } else {
                resultText.textContent = "Error: " + response.statusText;
            }
        } catch (error) {
            console.error("An error occurred:", error);
            resultText.textContent = "An error occurred while processing the request.";
        }
    }
});
