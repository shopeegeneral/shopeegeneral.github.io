function changeContent(text, button) {
    // Thay đổi nội dung thẻ <h1> trong .main-content
    const mainHeading = document.querySelector('.main-content h1');
    mainHeading.textContent = text;
  
    // Xóa lớp 'active' của tất cả các nút
    const buttons = document.querySelectorAll('.navbar-button button');
    buttons.forEach(btn => btn.classList.remove('active'));
  
    // Thêm lớp 'active' vào nút đã được nhấp
    button.classList.add('active');
  }
  
// Lấy phần tử `#tab4-viewbox` từ DOM
// const viewbox = document.getElementById('tab4-viewbox');

// // Tạo 16 ô vuông
// for (let i = 1; i <= 20; i++) {
//     // Tạo div mới cho từng ô
//     const item = document.createElement('div');
//     item.classList.add('viewbox-item');

//     // Tạo nội dung cho mỗi ô vuông
//     const palletID = document.createElement('p');
//     palletID.textContent = `Pallet ID: #${i}`;

//     const uidCountValue = Math.floor(Math.random() * 10); // Số UID ngẫu nhiên từ 0-9
//     const uidCount = document.createElement('p');
//     uidCount.textContent = `Số lượng UID: ${uidCountValue}`;

//     // Đặt màu nền của ô dựa trên số lượng UID
//     if (uidCountValue > 0) {
//         item.style.backgroundColor = 'yellow';
//     } else {
//         item.style.backgroundColor = 'white';
//     }

//     const type = document.createElement('p');
//     type.textContent = `Loại: ${String.fromCharCode(65 + (i % 3))}`; // Loại ngẫu nhiên A, B, C

//     // Tạo nút View và Chốt
//     const viewButton = document.createElement('button');
//     viewButton.textContent = 'View';
//     viewButton.classList.add('view');
//     viewButton.addEventListener('click', () => alert(`Viewing Pallet ${i}`));

//     const lockButton = document.createElement('button');
//     lockButton.textContent = 'Chốt';
//     lockButton.classList.add('lock');
//     lockButton.addEventListener('click', () => alert(`Pallet ${i} chốt`));

//     // Nhóm hai nút trong một div có class là button-group
//     const buttonGroup = document.createElement('div');
//     buttonGroup.classList.add('button-group');
//     buttonGroup.appendChild(viewButton);
//     buttonGroup.appendChild(lockButton);

//     // Thêm các phần tử vào ô vuông
//     item.appendChild(palletID);
//     item.appendChild(uidCount);
//     item.appendChild(type);
//     item.appendChild(buttonGroup); // Thêm nhóm nút vào ô vuông

//     // Thêm ô vuông vào `#tab4-viewbox`
//     viewbox.appendChild(item);
// }

let step3_data = [];
let merge_lane = [];
let merge_status = [];
let found_asn = [];
let box_data = [];

let pallet_id = "";
let uid_value = "";
let asn_value = "";
let type_value = "";
let mergelane_start_time = "";
let box_start_time = "";
let asn_end = ''

async function load_step3() {
    return fetch('https://script.google.com/macros/s/AKfycbzFJo-yAVWqO6RjIRPbmk0u28H9VZ7LncZ5ZboW7AoJ55IiG89O596eK5ET4NWfmQdqmA/exec')
        .then(res => res.json())
        .then(data => {
            step3_data = data.content;
            step3_data = step3_data.map(employee => [employee[1], employee[2], employee[8]]);
            console.log("tải xong step 3");
        });
}

async function load_box() {
    return fetch('https://script.google.com/macros/s/AKfycbxmuiisboZthDbjXyAq8bd-Al5NWVoTBLp0_fnsoUylAXEg4hsm2rjPWzKzaDU1U3-6/exec')
        .then(res => res.json())
        .then(data => {
            box_data = data.content;
            box_data = box_data.map(employee => [employee[0],employee[4]]);
            console.log("tải xong box");
        });
}

async function load_mergelane() {
    return fetch('https://script.google.com/macros/s/AKfycbxKKfZvhsoR7UzoA-CJghjwIBkacea2nmGdP5ZCnaAfV2PHZ-xChUbdjwgDpaCgBD9azg/exec')
        .then(res => res.json())
        .then(data => {
            merge_lane = data.content;
            merge_lane = merge_lane.map(employee => [employee[0], employee[1], employee[2], employee[3],employee[7]]);
            // console.table(merge_lane);
            console.log("tải xong mergelane");
        });
}

async function load_mergestatus() {
    return fetch('https://script.google.com/macros/s/AKfycbz6nToGSnllCRkvGE_WDSqEQVWVFPQ8hbXUA_Q-sDNT27YfgsJMvtA0ZAuw_pDh1EmP/exec')
        .then(res => res.json())
        .then(data => {
            merge_status = data.content;
            merge_status = merge_status.map(employee => [employee[0], employee[1], employee[2], employee[3]]);
            // console.table(merge_status);
            console.log("tải xong merge_status");
        });
}

// Hàm khởi tạo để load dữ liệu song song và gán sự kiện cho ô input
async function initialize() {
    await Promise.all([load_step3(), load_mergelane(),load_mergestatus(),load_box()]); // Chạy hai fetch song song
}

// async function initialize2() {
//     await Promise.all([load_mergelane(),load_mergestatus()]); // Chạy hai fetch song song
// }

document.getElementById("uid4").addEventListener("keyup", async function(event) {
    if (event.keyCode === 13) { // Kiểm tra phím Enter
        uid2 = document.getElementById("uid4").value;
        if (!uid2) {
            alert("Bạn chưa nhập UID")
            document.getElementById("uid4").focus();
            return
        }
        await initialize(); // Tải dữ liệu
        updateSuggestion();  // Thực hiện tìm kiếm sau khi tải xong
    }
});

document.getElementById("pallet4").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { // Kiểm tra phím Enter
        update_pallet();
    }
});

function clear_uid4() {
    document.getElementById("uid4").value = ""
    document.getElementById("uid4").focus()
}

function pallet_new() {
    pallet = document.getElementById("box_suggestion").textContent
    pallet1111 = document.getElementById("box_suggestion")
    if (pallet === "NEW") {
        pallet1111.style.color = "white";
        pallet1111.style.backgroundColor = "green"
    } else if (pallet === "-") {
        pallet1111.style.color = "black";
        pallet1111.style.backgroundColor = "white"
    } else {
        pallet1111.style.color = "white";
        pallet1111.style.backgroundColor = "purple"
    }
}
// Hàm tìm kiếm và cập nhật label
function updateSuggestion() {
    var now = new Date();
    mergelane_start_time = now.toLocaleDateString('en-US') + " " + now.toLocaleTimeString('en-GB');

    const uid4 = document.getElementById("uid4").value;
    const boxSuggestion = document.getElementById("box_suggestion");

    // Kiểm tra xem uid4 có tồn tại trong step3_data không
    const foundRow = step3_data.find(row => row[0] === uid4);
    if (!foundRow) {
        // Nếu uid4 không có trong step3_data, hiển thị thông báo sai UID và thoát
        alert("sai UID");
        boxSuggestion.textContent = "-";
        clear_uid4()
        pallet_new()
        return;
    }

    // Kiểm tra xem uid4 đã tồn tại trong merge_lane chưa
    const uidExistsInMergeLane = merge_lane.some(row => row[0] === uid4);
    if (uidExistsInMergeLane) {
        // Nếu uid4 đã tồn tại trong merge_lane, hiển thị thông báo UID đã tồn tại và thoát
        alert("UID này đã tồn tại");
        boxSuggestion.textContent = "-";
        clear_uid4()
        pallet_new()
        return;
    }

    // Nếu UID hợp lệ, tiếp tục xử lý logic tìm kiếm
    console.log(foundRow);
    [uid_value, asn_value, type_value] = foundRow;
    const found_asn = merge_status.find(row => row[2] === asn_value && row[3] === type_value);
    
    if (found_asn) {
        pallet_id = found_asn[0]
        boxSuggestion.textContent = pallet_id
        pallet_new()
    } else {
        pallet_id = "NEW"
        boxSuggestion.textContent = pallet_id
        pallet_new()
    }
    // const found_end = merge_lane.find(row => row[1] === asn_value && row[2] === type_value);
    
    
    // if (found_end) {
    //     asn_end = found_end[4]
    // } else {
    //     asn_end = ''
    // }
    // console.log(asn_end)    
    // // Tìm hàng khớp trong merge_lane dựa trên giá trị trong step3_data
    // const secondSearch = merge_lane.find(row => 
    //     row[1] === asn_value && row[2] === type_value
    // );
    // if (asn_end !== '') {
    //     pallet_id = "NEW"
    //     boxSuggestion.textContent = pallet_id
    //     pallet_new()
    // } else if (secondSearch) {
    //     pallet_id = secondSearch[3]
    //     boxSuggestion.textContent = pallet_id
    //     pallet_new()
    // } else {
    //     pallet_id = "NEW"
    //     boxSuggestion.textContent = pallet_id
    //     pallet_new()
    // }
    console.log(pallet_id)
    document.getElementById("pallet4").focus();
}

document.getElementById("station4").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { // Check if the Enter key is pressed
      document.getElementById('uid4').focus();
    }
});

function update_pallet() {
    // console.log(mergelane_start_time)
    var pallet_value = document.getElementById("pallet4").value;
    var station_value = document.getElementById("station4").value;
    var uid_value2 = document.getElementById("uid4").value;

    if (!station_value) {
        alert("Bạn chưa nhập Mã Station");
        document.getElementById("station4").focus();
        return
    }

    if (!pallet_value) {
        alert("Bạn chưa nhập Mã Pallet");
        document.getElementById("pallet4").focus();
        return
    }

    const found_box = merge_status.find(row => row[0] === pallet_value);
    if (found_box) {
        const box_status = found_box[1]
        console.log(box_status)
        if (box_status === "Open" && pallet_id === "NEW") {
            alert("Mã pallet này đang được sử dụng, vui lòng tìm pallet khác")
            document.getElementById("pallet4").value = "";
            document.getElementById("pallet4").focus();
            return
        }
    } else {
        alert("Sai mã pallet, vui lòng thử lại")
        document.getElementById("pallet4").value = "";
        document.getElementById("pallet4").focus();
        return
    }

    if (pallet_value === pallet_id || pallet_id === "NEW") {
        try {
            let merge_lane_table = new FormData();
            merge_lane_table.append("station_value", station_value);
            merge_lane_table.append("uid_value", uid_value2);
            merge_lane_table.append("asn_value", asn_value);
            merge_lane_table.append("type_value", type_value);
            merge_lane_table.append("pallet_value", pallet_value);
            merge_lane_table.append("start_time", mergelane_start_time);

            fetch('https://script.google.com/macros/s/AKfycbyyKSuiPm6LU3dJ1Mq1aKDVz4HM74XsHRSykMAscUUNrGvJAcfOFrGDDs0zKk3cciMG7g/exec', {
                method: 'POST',
                mode: 'no-cors',
                body: merge_lane_table
            }).then(response => response.text)
                .then(result => console.log('Đã gửi data thành công'))
                .catch(error => console.error('Error:', error));
                
            } catch (error) {
                console.error('Error:', error);
            }
            if (pallet_id === "NEW") {
                try{
                    const merge_status_table = new FormData();
                    merge_status_table.append("pallet_value", pallet_value);
                    merge_status_table.append("status_merge", "Open");

                    fetch('https://script.google.com/macros/s/AKfycbwiic0UI-6wsGzuTcUY6zdj2rOJaLlmrlBcoyfqfjLTIAYWCwsX64tUm8UDJSh6VVk_/exec', {
                        method: 'POST',
                        mode: 'no-cors',
                        body: merge_status_table
                    }).then(response => response.text)
                        .then(result => console.log('Đã gửi data thành công'))
                        .catch(error => console.error('Error:', error));
                } catch (error) {
                    console.error('Error:', error);
                }
            }
            clear_merge()
        } else {
            alert("Scan sai mã pallet")
            document.getElementById("pallet4").value = "";  
            document.getElementById("pallet4").focus()
        }
}

function clear_merge() {
    boxSuggestion = document.getElementById("box_suggestion")
    document.getElementById("uid4").value = "";
    document.getElementById("pallet4").value = "";
    boxSuggestion.textContent = "-";
    pallet_new()
    document.getElementById("uid4").focus();
}

// Lấy các phần tử từ DOM
const modal = document.getElementById("palletModal");
const completePalletButton = document.getElementById("complete_pallet");
const closeModalButton = document.getElementById("closeModal");

// Hàm mở modal
async function openModal() {
    await initialize()
    modal.style.display = "flex";
    document.getElementById("palletId").focus()
}

document.getElementById("palletId").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { // Kiểm tra phím Enter
        const palletId = document.getElementById("palletId").value;
        const found_box = merge_status.find(row => row[0] === palletId);
        if (!found_box) {
            alert("Mã Pallet không hợp lệ.");
            document.getElementById("palletId").value = ""
            document.getElementById("palletId").focus()
            document.getElementById("show_asn").textContent = ""
            return
        }
        if (found_box) {
            const box_status = found_box[1]
            console.log(box_status)
            if (box_status === "Close") {
                alert("Mã pallet này đang trống, vui lòng scan mã pallet đang chứa hàng")
                document.getElementById("palletId").value = "";
                document.getElementById("palletId").focus();
                document.getElementById("show_asn").textContent = ""
                return
            }
        }
        asn_value = found_box[2]
        type_value = found_box[3]
        found_asn = merge_lane.filter(row => row[1] === asn_value && row[2] === type_value && row[4] === '' && row[3] === palletId);
        console.table(found_asn)
        document.getElementById("show_asn").textContent = asn_value
        document.getElementById("boxId").focus()
        var now = new Date();
        box_start_time = now.toLocaleDateString('en-US') + " " + now.toLocaleTimeString('en-GB');
    }
});

document.getElementById("boxId").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { // Kiểm tra phím Enter
        box_up()
    }
});

function box_up() {
    const palletId = document.getElementById("palletId").value;
    const boxId = document.getElementById("boxId").value;

    const found_boxed = box_data.find(row => row[1] === boxId);
    console.log(found_boxed)
    if (found_boxed) {
        alert("Mã box này đã được sử dụng, vui lòng nhập box khác")
        document.getElementById("boxId").value == ""
        document.getElementById("boxId").focus()
        return
    }

    try{
        const merge_status_table = new FormData();
        merge_status_table.append("pallet_value", palletId);
        merge_status_table.append("status_merge", "Close");

        fetch('https://script.google.com/macros/s/AKfycbwiic0UI-6wsGzuTcUY6zdj2rOJaLlmrlBcoyfqfjLTIAYWCwsX64tUm8UDJSh6VVk_/exec', {
            method: 'POST',
            mode: 'no-cors',
            body: merge_status_table
        }).then(response => response.text)
            .then(result => console.log('Đã gửi data thành công'))
            .catch(error => console.error('Error:', error));
    } catch (error) {
        console.error('Error:', error);
    }

    // try {
    //     let box_table = new FormData();
    //     box_table.append("asn_value", asn_value);
    //     box_table.append("box_value", boxId);
    //     box_table.append("start_time", box_start_time);

    //     fetch('https://script.google.com/macros/s/AKfycbx8vzc_LBNJIUaGYYOFnrUJRzsb-cQaHKlWHQ2KP-6_X1D43xwG74NZ4VYw3RNjRLra/exec', {
    //         method: 'POST',
    //         mode: 'no-cors',
    //         body: box_table
    //     }).then(response => response.text)
    //         .then(result => console.log('Đã gửi data thành công'))
    //         .catch(error => console.error('Error:', error));
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }

    try {
        found_asn = found_asn.map(row => [...row, boxId]);
        found_asn = found_asn.map(row => [...row, box_start_time]);
        console.table(found_asn)
        
        let box_table = new FormData();
        box_table.append("merge_lane_data", JSON.stringify(found_asn));

        fetch('https://script.google.com/macros/s/AKfycbzyteM5v2qsOMLDczbuCSypAwnu3zQaL_uiXVO0vnNLShqqjiy20i4sPujMvN9YsGge/exec', {
            method: 'POST',
            mode: 'no-cors',
            body: box_table
        })
        .then(response => response.text())
        .then(result => console.log('Đã gửi data thành công'))
        .catch(error => console.error('Error:', error));
    } catch (error) {
        console.error('Error:', error);
    }

    document.getElementById("palletId").value = ""
    document.getElementById("boxId").value = ""
    document.getElementById("show_asn").textContent = ""
    closeModal()
}

// Hàm đóng modal
function closeModal() {
    modal.style.display = "none";
    document.getElementById("palletId").value = ""
    document.getElementById("boxId").value = ""
    document.getElementById("show_asn").textContent = ""
}

// Gán sự kiện click cho nút mở modal
completePalletButton.addEventListener("click", openModal);

// Gán sự kiện click cho nút đóng modal
closeModalButton.addEventListener("click", closeModal);

// Đóng modal khi người dùng nhấp ra ngoài nội dung modal
window.addEventListener("click", function(event) {
    if (event.target === modal) {
        closeModal();
    }
});
