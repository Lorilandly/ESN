function createAidRequestElement(aidRequest) {

}

function fetchAidRequestsList() {
    $.ajax('/aidRequests', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            const listbody = document.getElementById('request-list-body');
            for (const i in res) {
                const aidRequestElement = createUserList(res[i]);
                listbody.appendChild(aidRequestElement);
            }
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}