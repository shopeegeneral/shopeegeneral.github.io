
function step1() {
header1.querySelector('h1').innerText = 'Hàng giả mạo';
// Move to the next section or perform other actions
document.getElementById('home_button').style.display = 'none';
document.getElementById('part1').style.display = 'block';
}

function step2() {
header1.querySelector('h1').innerText = 'Correct Item';
// Move to the next section or perform other actions
document.getElementById('home_button').style.display = 'none';
document.getElementById('part2').style.display = 'block';
document.getElementById('p2_q2').style.display = 'none'
}

function step3() {
header1.querySelector('h1').innerText = 'Packaging';
// Move to the next section or perform other actions
document.getElementById('home_button').style.display = 'none';
document.getElementById('part3').style.display = 'block';
}

function step4() {
header1.querySelector('h1').innerText = 'Item Appearance';
// Move to the next section or perform other actions
document.getElementById('home_button').style.display = 'none';
document.getElementById('part4').style.display = 'block';
}
function checkAnswer1(answer) {
if (answer === 'Yes') {
    document.getElementById('question2').style.display = 'block';
    document.getElementById('buyerButton').style.display = 'block';
    document.getElementById('3plButton').style.display = 'block';
} else {
    p1_result = 'Next step with buyer: Trả lại hàng cho khách hàng\nCompensate seller: Không hoàn tiền Seller';
    openModal();
    var solutionText = document.getElementById("solutionText");
    solutionText.innerText = p1_result;
}
}

function checkAnswer2(answer) {
    // Perform actions based on the answers
    if (answer === 'Buyer') {
    var p1_result = 'Next step with buyer: Trả lại hàng cho khách hàng\nCompensate seller: Hoàn tiền 100% cho Seller'
    openModal();
    var solutionText = document.getElementById("solutionText");
    solutionText.innerText = p1_result;
    
    } else if (answer === '3PL') {
    var p1_result = 'Next step with buyer: Hoàn tiền cho khách hàng\nCompensate seller: Hoàn tiền 100% cho Seller'
    openModal();
    var solutionText = document.getElementById("solutionText");
    solutionText.innerText = p1_result;
    
    }
}

function showp2_q1(value) {
var p2_result = 'Next step with buyer: Hoàn tiền cho khách hàng\nNext step with seller: Trả hàng cho Seller\nCompensate seller: Không hoàn tiền'
    openModal();
    var solutionText = document.getElementById("solutionText");
    solutionText.innerText = p2_result;
}

function showp2_q1_1(value) {
document.getElementById('p2_q2').style.display = 'block';
document.getElementById('p2_q3').style.display = 'block';
}

function hb(value) {
    var data = [
        ["Mục kiểm tra", "Mức độ ảnh hưởng", "Khả năng bán lại", "Mức bồi thường"],
        ["Seal", "Medium", "Somewhat Sellable", "50%"],
        ["Packaging", "Medium", "Sellable", "20%"],
        ["Item missing", "Critical", "Unsellable", "100%"],
        ["Scratch + dirty", "Medium", "Sellable", "20%"],
        ["Water-damaged/ Bent/ broken/ crushed/ torn", "Critical", "Unsellable", "100%"]
    ];
    openModal2();
    createTable(data);
}

function fashion(value) {
    var data = [
        ["Kiểm tra các phần", "Mức độ ảnh hưởng", "Khả năng bán lại", "Mức bồi thường"],
        ["Seal", "N/a", "N/a", ""],
        ["Packaging", "Minor", "Sellable", "20%"],
        ["Item missing", "Medium", "Somewhat Sellable", "50%"],
        ["Scratch + dirty", "Medium", "Somewhat Sellable", "50%"],
        ["Water-damaged/ Bent/ broken/ crushed/ torn", "Critical", "Unsellable", "100%"],
        ["Tag", "Minor", "Sellable", "20%"]
    ];
    openModal2();
    createTable(data);
}

function hightech(value) {
    var data = [
        ["Kiểm tra các phần", "Mức độ ảnh hưởng", "Khả năng bán lại", "Mức bồi thường"],
        ["Seal", "Minor", "Sellable", "20%"],
        ["Packaging", "Minor", "Sellable", "20%"],
        ["Item missing", "Medium", "Somewhat sellable", "50%"],
        ["Scratch + dirty", "", "Somewhat sellable", "50%"],
        ["Water-damaged/ Bent/ broken/ crushed/ torn", "Deal breaker", "Unsellable", "100%"]
    ];
    openModal2();
    createTable(data);
}

function mombaby(value) {
    var data = [
        ["Kiểm tra các phần", "Mức độ ảnh hưởng", "Khả năng bán lại", "Mức bồi thường"],
        ["Seal", "Critical", "Unsellable", "100%"],
        ["Packaging", "Medium", "", ""],
        ["Item missing", "Minor", "Sellable", "20%"],
        ["Scratch + dirty", "Medium", "Somewhat sellable", "50%"],
        ["Water-damaged/ Bent/ broken/ crushed/ torn", "Critical", "Unsellable", "100%"]
    ];
    openModal2();
    createTable(data);
}

function hc(value) {
    var data = [
        ["Kiểm tra các phần", "Mức độ ảnh hưởng", "Khả năng bán lại", "Mức bồi thường"],
        ["Seal", "Minor", "Sellable", "20%"],
        ["Packaging", "Minor", "Sellable", "20%"],
        ["Item missing", "Medium", "Somewhat sellable", "50%"],
        ["Scratch + dirty", "Minor", "Somewhat sellable", "50%"],
        ["Water-damaged/ Bent/ broken/ crushed/ torn", "Critical", "Unsellable", "100%"]
    ];
    openModal2();
    createTable(data);
}

function milk(value) {
    var data = [
        ["Kiểm tra các phần", "Mức độ ảnh hưởng", "Khả năng bán lại", "Mức bồi thường"],
        ["Seal", "N/a", "", ""],
        ["Packaging", "Medium", "Somewhat sellable", "50%"],
        ["Item missing", "Minor", "Somewhat sellable", "50%"],
        ["Scratch + dirty", "Minor", "Somewhat sellable", "50%"],
        ["Water-damaged/ Bent/ broken/ crushed/ torn", "Critical", "Unsellable", "100%"]
    ];
    openModal2();
    createTable(data);
}


function showp2q22(value) {
document.getElementById('p2_q2').style.display = 'block';
document.getElementById('descriptionInput').style.display = 'block';
}

function showp3q2(value) {
var p3q2 = document.getElementById('p3_q2')
p3q2.style.display = 'block';
}

function checkAnswers3_4() {
// Lấy giá trị của câu hỏi 3 từ radio buttons
var answer3Elements = document.querySelectorAll('input[name="answer3"]:checked');
var answer3 = answer3Elements.length > 0 ? answer3Elements[0].value : null;

// Lấy giá trị của câu hỏi 4 từ radio buttons
var answer4Elements = document.querySelectorAll('input[name="answer4"]:checked');
var answer4 = answer4Elements.length > 0 ? answer4Elements[0].value : null;

if (answer3 === "1" && (answer4 === "1" || answer4 === "3")) {
// Đi tới phần tiếp theo hoặc thực hiện các hành động khác
var p2_result = 'Next step with buyer: Trả lại hàng cho khách hàng\nCompensate seller: Hoàn tiền 100% cho Seller';
console.log(p2_result)
showsection3();
} else if (answer3 === "1" && (answer4 === "2")) {
// Đi tới phần tiếp theo hoặc thực hiện các hành động khác
var p2_result = 'Next step with buyer: Trả lại hàng cho khách hàng\nCompensate seller: Hoàn tiền 100% cho Seller';
console.log(p2_result)
showsection3();
} else if ((answer3 === "2" || answer3 === "3") && (answer4 === "1" || answer4 === "3")) {
// Kiểm tra 3PL / Buyer, trả hàng cho Buyer / hoàn tiền cho seller
var p2_result = 'Check 3PL / Buyer, trả lại hàng cho Buyer / hoàn tiền cho seller';
console.log(p2_result)
showsection3();
} else if ((answer3 === "2" || answer3 === "3") && answer4 === "2") {
// Kiểm tra 3PL / hoàn tiền cho Buyer / hoàn tiền cho Seller
var p2_result = 'Check 3PL / Hoàn tiền cho Buyer / hoàn tiền cho Seller';
console.log(p2_result)
showsection3();
}
}

function showsection3() {
header1.querySelector('h1').innerText = 'Tình trạng sản phẩm';
// Move to the next section or perform other actions
document.getElementById('part2').style.display = 'none';
document.getElementById('part3').style.display = 'block';
document.getElementById('p3_q2').style.display = 'none';
}

// function checkAnswers5_6() {
// // Lấy giá trị của câu hỏi 3 từ radio buttons
// var answer5Elements = document.querySelectorAll('input[name="answer5"]:checked');
// var answer5 = answer5Elements.length > 0 ? answer5Elements[0].value : null;

// // Lấy giá trị của câu hỏi 4 từ radio buttons
// var answer6Elements = document.querySelectorAll('input[name="answer6"]:checked');
// var answer6 = answer6Elements.length > 0 ? answer6Elements[0].value : null;

// }

function checkAnswers5_6() {
    var answer5 = document.querySelector('input[name="answer4"]:checked');
    var answer6 = document.querySelector('input[name="answer5"]:checked');

    if (answer5 && answer6) {
        var resultText = "";

        if (answer5.value === "1" && answer6.value === "2") {
            // Sản phẩm còn seal và không bể vỡ
            resultText = "Refund to Buyer \n Return to Seller \n Compensate seller: 0%";
        } else if (answer5.value === "1" && answer6.value === "1") {
            // Sản phẩm còn seal và bị bể vỡ
            resultText = "Refund to Buyer \n Return to Seller \n Compensate seller: 5%";
        } else if (answer5.value === "2" && answer6.value === "2") {
            // Sản phẩm mất seal và không bể vỡ
            resultText = "Refund to Buyer \n Return to Seller \n Compensate seller: 5%";
        } else if (answer5.value === "2" && answer6.value === "1") {
            // Sản phẩm mất seal và bị bể vỡ
            resultText = "Refund to Buyer \n Return to Seller \n Compensate seller: 10%";
        }

        // Hiển thị kết quả
        // alert(resultText);
        openModal();
        var solutionText = document.getElementById("solutionText");
        solutionText.innerText = resultText;
    } else {
        alert("Vui lòng chọn đầy đủ câu trả lời cho cả hai câu hỏi.");
    }
}


function showsection4() {
header1.querySelector('h1').innerText = 'Chi tiết sản phẩm';
// Move to the next section or perform other actions
document.getElementById('part3').style.display = 'none';
document.getElementById('part4').style.display = 'block';
document.getElementById('p4_q2').style.display = 'none';
}

function showp4q2(value) {
var p4q2 = document.getElementById('p4_q2')
p4q2.style.display = 'block';
}

function checkAnswers7_8() {
// Lấy giá trị của câu hỏi 3 từ radio buttons
var answer7Elements = document.querySelectorAll('input[name="answer7"]:checked');
var answer7 = answer7Elements.length > 0 ? answer7Elements[0].value : null;

// Lấy giá trị của câu hỏi 4 từ radio buttons
var answer8Elements = document.querySelectorAll('input[name="answer8"]:checked');
var answer8 = answer8Elements.length > 0 ? answer8Elements[0].value : null;

showsection5();

}

function showsection5() {
header1.querySelector('h1').innerText = 'Tình trạng sản phẩm';
// Move to the next section or perform other actions
document.getElementById('part4').style.display = 'none';
document.getElementById('part5').style.display = 'block';
document.getElementById('p5_q2').style.display = 'none';
}

function showp5q2(value) {
var p5q2 = document.getElementById('p5_q2')
p5q2.style.display = 'block';
}
function openModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "flex";
}

function closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
    window.location.reload();
}

// Close the modal if the user clicks outside the modal content
window.onclick = function(event) {
    var modal = document.getElementById("myModal");
    var modal2 = document.getElementById("tableModal");
    if (event.target == modal || event.target == modal2) {
        modal.style.display = "none";
        window.location.reload();
    }
}

function openModal2() {
    var modal = document.getElementById("tableModal");
    modal.style.display = "flex";

    // Tạo bảng
    // createTable();
}


function createTable(data) {
    var table = document.getElementById("productTable");

    // Thêm dữ liệu vào bảng
    for (var i = 0; i < data.length; i++) {
        var row = table.insertRow(i);

        for (var j = 0; j < data[i].length; j++) {
            var cell = row.insertCell(j);
            cell.innerHTML = data[i][j];

            if (i === 0) {
                cell.style.fontWeight = "bold";
            }
            
        }
    }
}
  
  
