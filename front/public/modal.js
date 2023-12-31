function showMsg() {
    var dialog = document.getElementById("myMsgDialog");
    dialog.showModal();

}

function closeMsg() {
    var dialog = document.getElementById("myMsgDialog");
    dialog.close();
}

function changeStandard(radio) {
    let selectDiv = document.getElementById("period-select")
    let rankImg = document.getElementById("rankImg")
    let oneImg = document.getElementById("oneImg")
    const tableDiv = document.getElementById("tableDiv")
    const buttonDiv = document.getElementById('button')
    buttonDiv.innerHTML = ""

    if (radio.value == 'month') {
        let imsihtml = '<select id="start" onchange="changeSelect(this)">'
        let d = new Date();
        imsihtml += makeDateSelect(d, false) + `
            </select>
            <select id="end" onchange="changeSelect(this)">`

        imsihtml += makeDateSelect(d, true) + '</select>'
        selectDiv.innerHTML = imsihtml
        tableDiv.innerHTML = ""
        rankImg.src = ""
        oneImg.src = ""
    } else {
        selectDiv.innerHTML = "<br>"
    }
}

function changeSelect(select) {
    const start = document.getElementById('start');
    const end = document.getElementById('end');
    // console.log(select.id)
    // console.log(start.options[start.selectedIndex].text,
    // end.options[end.selectedIndex].text);
    if (start.options[start.selectedIndex].text > end.options[end.selectedIndex].text) {
        alert("기간이 맞지 않습니다.");
        if (select.id == 'start') {
            start.selectedIndex = end.selectedIndex
        } else {
            end.selectedIndex = start.selectedIndex
        }
    }
}

function count_check(obj) {
    var chkList = document.querySelectorAll("input[name=countryItem]:checked");
    if (chkList.length > 3) {
        alert("3개까지 체크 할수 있습니다.");
        obj.checked = false;
        return false;
    } else if (chkList.length < 1) {
        alert("1개 이상은 체크 하셔야 됩니다.");
        return false;
    }
}

function makeDiaglog(countries, func) {
    let imsihtml = `
            <button class="button" onclick='showMsg()'>국가 선택</button>
            <dialog id="myMsgDialog">
                <table class="table">
                    <thead>
                        <tr><th colspan="6"><h3>국가 선택</h3></th></tr>
                    <thead>
                    <tbody><tr>
                `

    for (let i = 0; i < countries.length; i++) {

        if (i < 3) {
            imsihtml += `
            <td><input type="checkbox" name="countryItem" onclick="count_check(this)" value="${countries[i]}" checked>
            <label for="${countries[i]}">&nbsp;${countries[i]}</label>
            </td>`
        } else {
            if (i % 6 == 0) {
                imsihtml += '</tr><tr>'
            }
            imsihtml += `
            <td><input type="checkbox" name="countryItem" onclick="count_check(this)" value="${countries[i]}">
            <label for="${countries[i]}">&nbsp;${countries[i]}</label>
            </td>`
        }


    }
    imsihtml +=
        `</tr></tbody>
        <tfoot>
            <tr>
                <td>
                    <input type="button" id="submit" onclick="postGraph()" value="확 인">
                    <input type="button" onclick="closeMsg()" value="취 소">
                </td>
            </tr>
        <tfoot>
    </dialog>
    `
    return imsihtml
}

function find() {
    const xhr = new XMLHttpRequest();
    const radio = document.querySelector('input[type=radio][name=standard]:checked');
    const countries = new Array();
    const element = document.getElementById("title");
    const buttonDiv = document.getElementById('button')
    const inputVal = element.options[element.selectedIndex].value;
    const errorPTag = document.getElementById("error")
    const tableDiv = document.getElementById("tableDiv")
    console.log(radio.value)
    var method = "";
    var url = "";
    const imgUrl = "http://13.209.180.103:8080/"


    console.log(inputVal)
    if (radio.value == 'month') {
        url = "/netflix-month"
        method = "POST"
        const start = document.getElementById("start");
        const startDate = start.options[start.selectedIndex].value;
        const end = document.getElementById("end");
        const endDate = end.options[end.selectedIndex].value;
        const rankImg = document.getElementById("rankImg")
        const oneImg = document.getElementById("oneImg")
        console.log(`title=${inputVal}&start=${startDate}&end=${endDate}`)

        xhr.open(method, url);
        // Type을 바꿔줘야 파싱을합니다.
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(`title=${inputVal}&start=${startDate}&end=${endDate}`);
    } else {
        url = `/netflix-total?title=${inputVal}`;
        method = "GET";
        xhr.open(method, url);
        xhr.send();
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        if (xhr.status === 200) {
            // console.log(xhr.responseText);

            let { ok, data, graph_urls } = JSON.parse(xhr.responseText)
            console.log(ok, data)
            if (ok == -1) {
                buttonDiv.innerHTML = `<p>기간 내에 해당 콘텐츠 top 10 데이터가 존재하지않습니다.</p>`;
                errorPTag.innerHTML = ""
                tableDiv.innerHTML = ""
                return false
            }
            else if (ok == -2) {
                buttonDiv.innerHTML = makeDiaglog(data.country_name, "postGraph")
                let imsihtml = makeTable(data)
                tableDiv.innerHTML = imsihtml
                errorPTag.innerHTML = "기간 내에 해당 나라에 top 10 데이터가 존재하지않습니다."
            } else {
                console.log(data, graph_urls)
                let imsihtml = makeTable(data)
                buttonDiv.innerHTML = makeDiaglog(data.country_name, "postGraph")
                errorPTag.innerHTML = ""
                tableDiv.innerHTML = imsihtml
                rankImg.src = imgUrl.concat(graph_urls[0])
                oneImg.src = imgUrl.concat(graph_urls[1])
            }
        } else {
            console.log("HTTP error", xhr.status, xhr.statusText);
        }
    };
}

function postGraph() {
    const xhr = new XMLHttpRequest();
    const radio = document.querySelector('input[type=radio][name=standard]:checked');
    const method = "POST";
    let url = "/total-graph";
    let imgUrl = "http://13.209.180.103:8080/"
    const rankImg = document.getElementById("rankImg")
    const oneImg = document.getElementById("oneImg")
    const errorPTag = document.getElementById("error")

    var chkList = document.querySelectorAll("input[name=countryItem]:checked");
    let list = new Array()

    chkList.forEach(function (c) {
        list.push(c.value)
    })

    var data = {
        'title': document.getElementById("title").value,
        'countries': list
    }

    if (radio.value == 'month') {
        url = "/month-graph"
        const start = document.getElementById("start");
        const startDate = start.options[start.selectedIndex].value;
        const end = document.getElementById("end");
        const endDate = end.options[end.selectedIndex].value;
        data["start"] = startDate
        data["end"] = endDate
    }
    xhr.open(method, url);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify(data));
    xhr.onload = () => {
        if (xhr.status === 200) {
            const res = JSON.parse(xhr.response);
            console.log(res);
            if (res.ok == false) {
                rankImg.src = ""
                oneImg.src = ""
                errorPTag.innerHTML = "기간 내에 해당 나라에 top 10 데이터가 존재하지않습니다."
            } else {
                errorPTag.innerHTML = ""
                rankImg.src = imgUrl.concat(res[0])
                oneImg.src = imgUrl.concat(res[1])
            }
            closeMsg()
        } else {
            console.log("HTTP error", xhr.status, xhr.statusText);
        }
    };
}

function makeDateSelect(now, end) {
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    imsihtml = ''
    while (year >= 2021) {
        if (year == 2021 && month < 6) break
        if (end) imsihtml += `<option value="${year}-${month + 1}">${year}-${String(month).padStart(2, "0")}</option>`
        else imsihtml += `<option value="${year}-${month}">${year}-${String(month).padStart(2, "0")}</option>`
        month--;
        if (month == 0) {
            year--;
            month = 12
        }
    }
    return imsihtml
}

