document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox','fa-inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent','fa-mail-forward"'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive', 'fa-folder'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('compose', 'fa-pencil-square-o'));

  document.querySelector('#inbox').addEventListener('click', (e) => {
    e.preventDefault();
  
    //Handles the class active
    document.querySelector('#sent') ? document.querySelector('#sent').classList.remove('active') : '';
    document.querySelector('#archived') ? document.querySelector('#archived').classList.remove('active') : '';
    document.querySelector('#inbox').classList.add('active');
  
  });
  
  document.querySelector('#sent').addEventListener('click', (e) => {
    e.preventDefault();
  
    //Handles the class active
    document.querySelector('#archived') ? document.querySelector('#archived').classList.remove('active') : '';
    document.querySelector('#inbox') ? document.querySelector('#inbox').classList.remove('active') : '';
    document.querySelector('#sent').classList.add('active');
  
  });
  
  document.querySelector('#archived').addEventListener('click', (e) => {
    e.preventDefault();
  
    //Handles the class active
    document.querySelector('#inbox') ? document.querySelector('#inbox').classList.remove('active') : '';
    document.querySelector('#sent') ? document.querySelector('#sent').classList.remove('active') : '';
    document.querySelector('#archived').classList.add('active');
  
  });

  // Add event listener to the compose form
  document.querySelector("#compose-form").addEventListener("submit", (e) => {
    e.preventDefault();

    async_send_mail();
  });

  document.querySelector('body').addEventListener('click', function(event) {
    //every email row has this class
    if (event.target.classList == 'email-hover ') {
      //function that opens up the clicked mail:
      console.log('yey');
      
    }
  }); 

  // By default, load the inbox
  load_mailbox('inbox','fa-inbox');
});

function compose_email(mailbox, icon) {
  //Displays the title
  document.querySelector('#emails-view').innerHTML = `<h2><i class="fa ${icon}"></i> ${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h2>`;

  // Show compose view and hide other views
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#inbox-view').style.display = 'none';
  document.getElementById('read-view').classList.add('d-none');

  // Clears out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox, icon) {
  // Show the mailbox and hide other views
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#inbox-view').style.display = 'block';
  document.getElementById('read-view').classList.add('d-none');

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h2><i class="fa ${icon}"></i> ${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h2>`;
  
  // Get data the data of corresponding mailbox from the server
  async_get_mailbox(mailbox);
}

const async_send_mail = async () => {

  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  try {
      const response = await fetch('/emails', {
          method: 'POST',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "recipients": recipients,
            "subject": subject,
            "body": body
          })
      });
      const data = await response.json(); 
      
      //Email not found
      if(data.message == 'Email sent successfully.'){
         //toast bootstrap handling... 
        const toastEl = document.getElementById('toast-success');
        const toast_success = new bootstrap.Toast(toastEl, []);
        document.querySelector('.toast-success-content').textContent = `${data.message}`;
        toast_success.show();

        load_mailbox('sent','fa-mail-forward"');
        //Handles the class active
        document.querySelector('#archived') ? document.querySelector('#archived').classList.remove('active') : '';
        document.querySelector('#inbox') ? document.querySelector('#inbox').classList.remove('active') : '';
        document.querySelector('#sent').classList.add('active');
      }
      if(data.error){
        const toastEl = document.getElementById('toast-error');
        const toast_error = new bootstrap.Toast(toastEl, []);
        document.querySelector('.toast-error-content').textContent = `${data.error}`;
        toast_error.show();

      }
  }catch(error) {
      console.log(error)
  } 
}

const async_get_mailbox = async (mailbox) => {
  try {
      const response = await fetch(`/emails/${mailbox}`, {
          method: 'GET',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          }
      });
      const data = await response.json(); 

      document.getElementById('table_body').innerHTML = '';
      document.getElementById('table_body').setAttribute('data-mailbox',mailbox);
      console.log(data);
      if(data.message){
        
        //something went wrong
        let html = `
                  <tr >
                    <td class="name">Recipients</td>
                    <td class="subject">Subject</td>
                    <td class="time">Timestamp</td>
                  </tr>
                  `;
        html += `
                  <tr>
                    <td colspan="3">${data.message}</td>
                  </tr>`;
        document.getElementById('table_body').insertAdjacentHTML('afterend', html);
      }else{
        //Creates table rows with every single email
        let html = `
                  <tr >
                    <td class="name">From</td>
                    <td class="subject">Subject</td>
                    <td class="time">Timestamp</td>
                  </tr>
                  `;

        data.forEach(email => {
          html += 
                `<tr onclick="emailClick(${email.id});" class="email-hover ${mailbox == 'sent'? 'read' : email.read != false ? 'read' : ''}">
                  <td class="name">${email.sender}</td>
                  <td class="subject">${email.subject}</td>
                  <td class="time">${email.timestamp}</td>
                </tr>`
          
        });
        document.getElementById('table_body').insertAdjacentHTML('beforeend',html);
      }
  }catch(error) {
      console.log(error)
  } 
}

//Builds the email page - read view
const get_single_email = async (id) =>{
  try{
      const res = await fetch(`/emails/${id}`); 
      const data = await res.json();

      if(data){
        console.log(data);

        document.querySelector('.subject-email').textContent = `${data.subject}`;
        document.getElementById('from_email').value = `${data.sender}`;
        document.getElementById('to_email').value = `${data.recipients.toString()}`;
        document.getElementById('email_body').textContent = `${data.body}`;

        let buttons_div = ``;
        document.getElementById('btn_div') ? document.getElementById("btn_div").remove() : '';
        //BTNS LOGIC DEPENDING ON THE MAILBOX
        //note: you cannot acharive sent items
        if(document.getElementById('table_body').getAttribute('data-mailbox') == 'sent'){
          buttons_div = `
                  <div class="d-flex justify-content-end" id="btn_div">
                      <button class="btn btn-danger btn-sm ms-2" onclick="reply(${id})">Reply</button>
                  </div>`;
        }else if(data.archived == false){
          buttons_div = `
                  <div class="d-flex justify-content-end" id="btn_div">
                      <button class="btn btn-danger btn-sm ms-2" onclick="toggleArchive(${id}, true)">Archive</button>
                      <button class="btn btn-danger btn-sm ms-2" onclick="reply(${id})">Reply</button>
                  </div>`;
        }else{
          buttons_div = `
                  <div class="d-flex justify-content-end" id="btn_div">
                      <button class="btn btn-danger btn-sm ms-2" onclick="toggleArchive(${id}, false)">Unarchive</button>
                      <button class="btn btn-danger btn-sm ms-2" onclick="reply(${id})">Reply</button>
                  </div>`;
        }
        document.getElementById('email_body').insertAdjacentHTML('afterend',buttons_div);

      }

  }catch(err){
      console.error(err);
  }
}

//Sets the email to read
const set_read_true = async (id) =>{
  try{
      const res = await fetch(`/emails/${id}`, {
        method: 'PUT',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "read": true
        })
    });
    
  }catch(err){
      console.error(err);
  }
}

function emailClick(id) {
  document.querySelector('#inbox-view').style.display = 'none';
  document.getElementById('read-view').classList.remove('d-none');
  
  //Builds the email page - read view
  get_single_email(id);
  //Sets the email to read
  set_read_true(id);

}

const toggleArchive = async (id, bool) =>{
  try{
      const res = await fetch(`/emails/${id}`, {
        method: 'PUT',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "archived": bool
        })
    });

    load_mailbox('inbox','fa-inbox');
    //Handles the class active
    document.querySelector('#sent') ? document.querySelector('#sent').classList.remove('active') : '';
    document.querySelector('#archived') ? document.querySelector('#archived').classList.remove('active') : '';
    document.querySelector('#inbox').classList.add('active');

    /*if(bool == false){
      load_mailbox('inbox','fa-inbox');
      //Handles the class active
      document.querySelector('#sent') ? document.querySelector('#sent').classList.remove('active') : '';
      document.querySelector('#archived') ? document.querySelector('#archived').classList.remove('active') : '';
      document.querySelector('#inbox').classList.add('active');
    }else{
      load_mailbox('archive', 'fa-folder');
      //Handles the class active
      document.querySelector('#inbox') ? document.querySelector('#inbox').classList.remove('active') : '';
      document.querySelector('#sent') ? document.querySelector('#sent').classList.remove('active') : '';
      document.querySelector('#archived').classList.add('active');
    }*/

  }catch(err){
      console.error(err);
  }
}

function reply(id) {

  const async_reply = async (id) =>{
    try{
        const res = await fetch(`/emails/${id}`); 
        const data = await res.json();
  
        if(data){
          document.querySelector('#compose-recipients').value = `${data.sender}`;
          document.querySelector('#compose-subject').value = data.subject.slice(0,4) == "Re: " ? data.subject : "Re: " + data.subject;
          document.querySelector('#compose-body').value = `On ${data.timestamp} <${data.sender}> wrote:\n${data.body}\n ------------------------------------\n`;
          document.querySelector('#compose-body').focus();
        }
  
    }catch(err){
        console.error(err);
    }
  }
  async_reply(id);

  // Show compose view and hide other views
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#inbox-view').style.display = 'none';
  document.getElementById('read-view').classList.add('d-none');

}