const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'invoiceNumber.txt');

// Read the current invoice number
function getCurrentInvoiceNumber() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return parseInt(data, 10);
    } catch (err) {
        console.error('Error reading invoice number file:', err);
        return null;
    }
}

// Increment and update the invoice number
function incrementInvoiceNumber() {
    try {
        let currentInvoiceNumber = getCurrentInvoiceNumber();
        if (currentInvoiceNumber === null) {
            currentInvoiceNumber = 1000;
        }
        const newInvoiceNumber = currentInvoiceNumber + 1;
        fs.writeFileSync(dataFilePath, newInvoiceNumber.toString(), 'utf8');
        return newInvoiceNumber;
    } catch (err) {
        console.error('Error updating invoice number file:', err);
        return null;
    }
}


function calculateSubTotal(totalLaborTime, pianoCharge, poolTableCharge, rate, calloutFee) {
    return (totalLaborTime + pianoCharge + poolTableCharge + calloutFee) * rate;
}

function isGSTIncluded(gstValue) {
    return gstValue == 1;
}

function generateInvoice() {
    const form = document.getElementById('invoice-form');
    const formData = new FormData(form);

    const clientName = formData.get('clientName');
    const clientEmail = formData.get('clientEmail');
    const totalLaborTime = parseFloat(formData.get('totalLaborTime'));
    const calloutFee = parseFloat(formData.get('calloutFee'));
    const rate = parseFloat(formData.get('rate'));
    const gstIncluded = isGSTIncluded(formData.get('gst'));
    const stairCharges = parseFloat(formData.get('stairCharges')) || 0;
    const pianoCharge = parseFloat(formData.get('pianoCharge')) || 0;
    const poolTableCharge = parseFloat(formData.get('poolTableCharge')) || 0;
    const deposit = parseFloat(formData.get('deposit')) || 0;

    const subTotal = calculateSubTotal(totalLaborTime, pianoCharge, poolTableCharge, rate, calloutFee);
    const gstPercentage = gstIncluded ? '10%' : '0%';
    const surcharge = gstIncluded ? subTotal * 0.10 : 0;
    const hasAdditionalCharges = stairCharges !== 0 || pianoCharge !== 0 || poolTableCharge !== 0;
    const totalCharge = subTotal + surcharge - deposit + stairCharges;
    const invoiceNumber = incrementInvoiceNumber(); // Generate the new invoice number

    const invoiceHTML = `
        <table>
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                <img src="logo.png" alt="House moving logo" />
                            </td>
                            <td class="details">
                                ${gstIncluded ?
            `<b>INVOICE</b><br />
                                    Moving Service` :
            `<b>Payment Overview</b><br />
                                    Moving Service`
        }
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                ACE MOVERS PTY LTD.<br />
                                ACN:640 368 930 <br />
                                ABN:346 4036 8930 <br />
                                Contact: 1300-136-735
                            </td>
                            <td>
                                Client Name: ${clientName}<br />
                                Email: ${clientEmail}<br />
                                Invoice Number: ${invoiceNumber}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="heading">
                <td colspan="2">Timing</td>
            </tr>
            <tr class="item">
                <td>Total Work Hours</td>
                <td>${totalLaborTime} hours</td>
            </tr>
            <tr class="item">
                <td>Callout Fee</td>
                <td>${calloutFee} hour/s</td>
            </tr>
            <tr class="heading">
                <td colspan="2">Rate</td>
            </tr>
            <tr class="item">
                <td>Per Hour Rate</td>
                <td>$${rate.toFixed(2)}</td>
            </tr>
            <tr class="item">
                <td>SubTotal</td>
                <td>$${subTotal.toFixed(2)}</td>
            </tr>
            <tr class="item">
                <td>GST</td>
                <td>${gstPercentage}</td>
            </tr>
            <tr class="item">
                <td>Surcharge</td>
                <td>$${surcharge.toFixed(2)}</td>
            </tr>
            ${hasAdditionalCharges ? `
                <tr class="heading">
                    <td colspan="2">Additional Charges</td>
                </tr>
                ${stairCharges !== 0 ? `
                    <tr class="item">
                        <td>Stair Charge</td>
                        <td>$${stairCharges.toFixed(2)}</td>
                    </tr>` : ''}
                ${pianoCharge !== 0 ? `
                    <tr class="item">
                        <td>Piano Charge</td>
                        <td>${pianoCharge.toFixed(2)} hours</td>
                    </tr>` : ''}
                ${poolTableCharge !== 0 ? `
                    <tr class="item">
                        <td>Pool Table Charge</td>
                        <td>${poolTableCharge.toFixed(2)} hours</td>
                    </tr>` : ''}
            ` : ''}
            <tr class="heading">
                <td colspan="2">Deposit</td>
            </tr>
            <tr class="item last">
                <td>Initial Deposit Adjustment</td>
                <td>-$${deposit.toFixed(2)}</td>
            </tr>
            <tr class="total">
                <td></td>
                <td><b>Total: $${totalCharge.toFixed(2)}</b></td>
            </tr>
        </table>
        <p>For any queries please contact us at info@acemovers.com.au or call us at 1300 136 735</p>
    `;

    document.getElementById('invoice-preview').innerHTML = invoiceHTML;
}

function downloadInvoice() {
    const element = document.getElementById('invoice-preview');
    html2pdf().from(element).save('invoice.pdf');
}
