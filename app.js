const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");

const app = express();

app.use(express.static("public"));
app.use(fileUpload());

app.post("/extract-data", async (req, res) => {
    try {
        if (!req.files || !req.files.pdfFile) {
            res.status(400).json({ error: "Bad Request: PDF file is missing." });
            return;
        }

        const pdfData = req.files.pdfFile.data;
        const extractedData = await extractDataFromPDF(pdfData);
        res.json(extractedData);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function extractDataFromPDF(pdfData) {
    try {
        const pdfText = (await pdfParse(pdfData)).text;
        
        // Implement your PDF text parsing logic here
        const orderNumber = extractOrderNumber(pdfText);
        const invoiceNumber = extractInvoiceNumber(pdfText);
        const buyerName = extractBuyerName(pdfText);
        const buyerAddress = extractBuyerAddress(pdfText);
        const invoiceDate = extractInvoiceDate(pdfText);
        const orderDate = extractOrderDate(pdfText);
        const productDetails = extractProductDetails(pdfText);

        const extractedData = {
            "Order Number": orderNumber,
            "Invoice Number": invoiceNumber,
            "Buyer Name": buyerName,
            "Buyer Address": buyerAddress,
            "Invoice Date": invoiceDate,
            "Order Date": orderDate,
            "Product Details": productDetails,
        };

        return extractedData;
    } catch (error) {
        console.error("An error occurred while extracting data:", error);
        throw error;
    }
}

// Define the extraction functions for each data point here...
function extractOrderNumber(pdfText) {
    const orderNumberMatch = pdfText.match(/Purchase Order Number\n(\d+)/);
    return orderNumberMatch ? orderNumberMatch[1] : "N/A";
}

function extractInvoiceNumber(pdfText) {
    const invoiceNumberMatch = pdfText.match(/Invoice Number\n(.+)/);
    return invoiceNumberMatch ? invoiceNumberMatch[1] : "N/A";
}

function extractBuyerName(pdfText) {
    const buyerNameMatch = pdfText.match(/BILL TO:\n([\w\s]+)\n/);
    return buyerNameMatch ? buyerNameMatch[1] : "N/A";
}

function extractBuyerAddress(pdfText) {
    const buyerAddressMatch = pdfText.match(/BILL TO:\s*([\s\S]+?)\n/);
    return buyerAddressMatch ? buyerAddressMatch[1].trim() : "N/A";
}

function extractInvoiceDate(pdfText) {
    const invoiceDateMatch = pdfText.match(/Invoice Date\n([\s\S]+?)\n/);
    return invoiceDateMatch ? invoiceDateMatch[1].trim() : "N/A";
}

function extractOrderDate(pdfText) {
    const orderDateMatch = pdfText.match(/Order Date\n([\s\S]+?)\n/);
    return orderDateMatch ? orderDateMatch[1].trim() : "N/A";
}

function extractProductDetails(pdfText) {
    const productDetailsRegex = /(\d+)([\s\S]+?)(\d+)Rs\.(\d+\.\d+)(\d+)\n(\d+)Rs\.(.+)\n(\d+)\nIGST @([\d.]+)%\s+:(Rs\.\d+\.\d+)/g;
    const productDetailsMatches = [...pdfText.matchAll(productDetailsRegex)];

    const productDetails = productDetailsMatches.map(match => {
        return {
            "S.No": match[1],
            "Description": match[2].trim(),
            "HSN": match[3],
            "Unit Price": match[4],
            "Qty": match[5],
            "Discount": match[6],
            "Product Value": match[7],
            "Tax Rate": `${match[9]}%`,
            "Total": match[11],
        };

    });

   // console.log(productDetails)

    return productDetails;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
