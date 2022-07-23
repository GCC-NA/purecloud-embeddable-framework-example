const platformClient = require('platformClient');

document.addEventListener('DOMContentLoaded',function(){
    const client = platformClient.ApiClient.instance;
    let loginData;
    client.loginImplicitGrant("31e8192e-21e1-4f5c-9463-f4567fc83373", "https://localhost/example.html")
        .then((data) => {
            loginData = data;
        })
        .catch((err) => {
            // Handle failure response
            console.log(err);
        });
    document.getElementById("clickToDial").addEventListener("click", clickToDial);
    document.getElementById("clickToEmail").addEventListener("click", clickToEmail);
    document.getElementById("addAssociation").addEventListener("click", addAssociation);
    document.getElementById("addAttribute").addEventListener("click", addAttribute);
    document.getElementById('addTransferContext').addEventListener("click", addTransferContext);
    document.getElementById('updateUserStatus').addEventListener("click", updateUserStatus);
    document.getElementById('pickupInteraction').addEventListener("click", updateInteractionState);
    document.getElementById('securePauseInteraction').addEventListener("click", updateInteractionState);
    document.getElementById('disconnectInteraction').addEventListener("click", updateInteractionState);
    document.getElementById('holdInteraction').addEventListener("click", updateInteractionState);
    document.getElementById('muteInteraction').addEventListener("click", updateInteractionState);
    document.getElementById('updateAudioConfiguration').addEventListener("click", updateAudioConfiguration);
    document.getElementById('sendCustomNotification').addEventListener("click", sendCustomNotification);

    document.getElementById('view-interactionList').addEventListener("click", setView);
    document.getElementById('view-calllog').addEventListener("click", setView);
    document.getElementById('view-newInteraction').addEventListener("click", setView);
    document.getElementById('view-callback').addEventListener("click", setView);
    document.getElementById('view-settings').addEventListener("click", setView);

    window.addEventListener("message", function(event) {
        var message = JSON.parse(event.data);
        if(message){
            if(message.type == "screenPop"){
                document.getElementById("screenPopPayload").value = event.data;
            } else if(message.type == "processCallLog"){
                document.getElementById("processCallLogPayLoad").value = event.data;
            } else if(message.type == "openCallLog"){
                document.getElementById("openCallLogPayLoad").value = event.data;
            } else if(message.type == "interactionSubscription"){
                document.getElementById("interactionSubscriptionPayload").value = event.data;
            } else if(message.type == "userActionSubscription"){
                document.getElementById("userActionSubscriptionPayload").value = event.data;
            } else if(message.type == "notificationSubscription"){
                document.getElementById("notificationSubscriptionPayload").value = event.data;
            } else if(message.type == "contactSearch") {
                document.getElementById("searchText").innerHTML = ": " + message.data.searchString;
                sendContactSearch();
            }
        }
    });

    function clickToDial() {
        console.log('process click to dial');
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'clickToDial',
            data: { number: '3172222222', autoPlace: true }
        }), "*");
    }
    function clickToEmail() {
        console.log('process click to email');
        // document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
        //     type: 'clickToDial',
        //     data: { address: 'shane.garner@genesys.com', type: 'email', autoPlace: true }
        // }), "*");

        let conversationApiInstance = new platformClient.ConversationsApi();
                const body = {
                    "queueId": "60e328d1-60ed-43e4-8d5c-2286dad98b68",
                    "toAddress": "shane@garnercrew.com",
                    "toName": "Shane Garner",
                    "direction": "OUTBOUND",
                    "textBody": "Hey now again from EF",
                    "subject": "Api Email EF"
                };
                conversationApiInstance.postConversationsEmails(body)
                    .then((emailRespData) => {
                        console.log(`postConversationsEmails success! data: ${JSON.stringify(emailRespData, null, 2)}`);
                        fetch('https://localhost/assets/Genesys.pdf')
                            .then(res => res.blob())
                            .then(blob => {
                                const fd = new FormData();
                                fd.append('conversationId', emailRespData.id);
                                fd.append('file', new File([blob], 'Genesys.pdf'));
                                axios.post('https://apps.mypurecloud.com/uploads/postino-attachments', fd,
                                    {
                                        headers: {
                                            'Authorization': 'Bearer ' + loginData.accessToken,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    })
                                    .then(res => console.log("done uploading attachment" + JSON.stringify(res)))
                                    .catch((err) => {
                                        // Handle failure response
                                        console.log("error with axios", err);
                                    });
                            });
                    })
                    .catch((err) => {
                        console.log('There was a failure calling postConversationsEmails');
                        console.error(err);
                    });

    }
    function addAssociation() {
        console.log('process add association');
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'addAssociation',
            data: JSON.parse(document.getElementById("associationPayload").value)
        }), "*");
    }

    function addAttribute() {
        console.log('process add attribute');
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'addAttribute',
            data: JSON.parse(document.getElementById("attributePayload").value)
        }), "*");
    }

    function addTransferContext() {
        console.log('process add Transfer Context');
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'addTransferContext',
            data: JSON.parse(document.getElementById("transferContextPayload").value)
        }), "*");
    }

    function sendContactSearch() {
        console.log('process add Search Context');
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'sendContactSearch',
            data: JSON.parse(document.getElementById("contactSearchPayload").value)
        }), "*");
    }

    function updateUserStatus() {
        console.log('process user status update');
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'updateUserStatus',
            data: { id:document.getElementById("statusDropDown").value }
        }), "*");
    }

    function updateInteractionState(event) {
        console.log('process interaction state change');
        var lastInteractionPayload = JSON.parse(document.getElementById("interactionSubscriptionPayload").value);
        var interactionId;
        if (lastInteractionPayload.data.interaction.old){
            interactionId = lastInteractionPayload.data.interaction.old.id;
        }else {
            interactionId = lastInteractionPayload.data.interaction.id;
        }
        let payload = {
            action: event.target.outerText,
            id: interactionId
        };
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'updateInteractionState',
            data: payload
        }), "*");
    }

    function updateAudioConfiguration(){
        console.log('Update Audio Configuration');
        var payload = {
            call: document.getElementById('audio-call').checked,
            chat: document.getElementById('audio-chat').checked,
            email: document.getElementById('audio-email').checked,
            callback: document.getElementById('audio-callback').checked,
            message: document.getElementById('audio-message').checked,
            voicemail: document.getElementById('audio-voicemail').checked
        }
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'updateAudioConfiguration',
            data: payload
        }), "*");
    }


    function setView(event) {
        console.log('process view update');
        let payload = {
            type:"main",
            view: {
                name:event.target.outerText
            }
        };
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'setView',
            data: payload
        }), "*");
    }

    function sendCustomNotification(){
        console.log('Send Custom User Notification');
        var payload = {
            message: document.getElementById('customNotificationMessage').value,
            type: document.getElementById('notificationType').value,
            timeout: document.getElementById('notificationTimeout').value
        };
        document.getElementById("softphone").contentWindow.postMessage(JSON.stringify({
            type: 'sendCustomNotification',
            data: payload
        }), "*");
    }
})
