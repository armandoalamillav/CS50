document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Use button to submit email
  document.querySelector('#compose-submit').addEventListener('click', (event) => {
    event.preventDefault();
    send_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');


});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#individual-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(){
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      if(result.error) {
        console.error("Error:", result.error);
      } else {
        // Redirect to mailbox
        load_mailbox('sent');
      }
  });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#individual-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailbox-title').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;

  fetch(`/emails/${mailbox}`)
  .then(response => {
    console.log(response); // Check the response object
    return response.json();
  })
  .then(emails => {

    // Clear the container, not the title
    document.querySelector('#emails-list').innerHTML = '';

    // Loop through each email and create a div
    emails.forEach(email => {
      const element = document.createElement('div');
      element.className = 'email-box';
      // If email is read, format its background to white
      if (email.read) {
        element.classList.add('email-read');
      }
      // If email is not read, format its background to grey
      else {
        element.classList.add('email-unread');
      }
      // Display sender, subject and timestamp
      element.innerHTML = `
        <strong>From:</strong> ${email.sender} <br>
        <strong>Subject:</strong> ${email.subject} <br>
        <strong>Timestamp:</strong> ${email.timestamp}
        `;
      element.addEventListener('click', () =>
        load_email(email.id, mailbox));
      // In coordination with the loop, append each email to the list
      document.querySelector('#emails-list').append(element);
    });
  })
  // Catch errors
  .catch(error => {
    console.error('Error:', error);
  })
}

function load_email(email_id, mailbox) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#individual-email-view').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

    // Create empty individual email view
    document.querySelector('#individual-email-view').innerHTML = '';

    // Create view for individual email
    const element = document.createElement('div');
    element.innerHTML = `
      <strong>From:</strong> ${email.sender} <br>
      <strong>To:</strong> ${email.recipients} <br>
      <strong>Subject:</strong> ${email.subject} <br>
      <strong>Timestamp:</strong> ${email.timestamp} <br>
      <strong>Body:</strong> ${email.body}
      `;

    // Create an archive/unarchive button if the email is not from the Sent mailbox
      if (mailbox !== 'sent') {
            // Create an archive/unarchive button
        const archiveButton = document.createElement('button');
        archiveButton.innerHTML = email.archived ? 'Unarchive' : 'Archive';
        archiveButton.addEventListener('click', () => {
          // Update archive/unarchive status by sending a put request
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: !email.archived
            })
        })
        // Reload inbox after archiving/unarchiving
      .then(() => load_mailbox('inbox'));
    });
    document.querySelector('#individual-email-view').append(archiveButton);
  }

    const replyButton = document.createElement('button');
    replyButton.innerHTML = 'Reply';
    replyButton.addEventListener('click', () => {
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email.subject;
      if (!subject.startsWith('Re: ')) {
        subject = `Re: ${subject}`;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote:\n${email.body}\n\n`;
    });

    document.querySelector('#individual-email-view').append(element);
    document.querySelector('#individual-email-view').append(replyButton);

    // Mark email as read
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
