document.addEventListener('DOMContentLoaded', function() {

  function fillTable (client) {

    client.contacts.sort((a, b) => a.type > b.type ? 1: -1);

    let tableClients = document.querySelector('.clients-table');
    let tr = document.createElement('tr');

    tr.setAttribute('id', client.id);
    tr.classList.add('trClient');

    for (j=0; j < 6; j++) {

      let td = document.createElement('td');

      (j == 0) ?  td.innerHTML = client.id.substr(8) :

        (j== 1) ? td.innerHTML = client.surname.trim() + ' ' +  client.name + ' ' +  client.lastName :

          (j == 2)  ?  td.innerHTML = addDate(client.createdAt) : td.innerHTML = addDate(client.updatedAt);

      if (j == 4) {

        td.innerHTML = '';

        client.contacts.forEach(item => {

          let div = document.createElement('div');

          div.classList.add('block-contact');

          div.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16"><use xlink:href="img/sprite.svg#${item.type}"></use></svg>`;

          td.append(div);

          let tooltip  = document.createElement('div');

          tooltip.classList.add('tooltip');

          tooltip.innerHTML = item.value;

          tooltip.style.transform = `translateX(-${getWidhtElement(tooltip) / 2 + (getWidhtElement(tooltip) * 0.15)}px)`;


          td.querySelectorAll('svg').forEach(item => {

            item.classList.add('svg-contact');
            item.after(tooltip);
          });
        });
      }

      if (j == 5) {
        td.innerHTML = document.querySelector('.change-or-delete').innerHTML ;

        td.querySelector('.change').addEventListener('click', () => {
          changeAndSaveClient(client.id, client);
        });

        td.querySelector('.delete').addEventListener('click', () => {
          deleteClient(client.id);
        });
      }
      tr.appendChild(td);
    }

    tableClients.appendChild(tr);
  }

  function addClients () {

    let newClientWindow = document.querySelector('.new-client-window');

    newClientWindow.style.top = `calc(30% - ${newClientWindow.offsetHeight / 2}px)`;

    document.querySelector('.svg-close').addEventListener('click', () => {

      closeModalWindow();
    });

    document.querySelector('.cancel').addEventListener('click', () => {

      closeModalWindow();
    });

    let btnAddClient = document.querySelector('.btn-add-client');

    let formAddNewClient = document.querySelector('.form-add-new-client');

    formAddNewClient.querySelectorAll('input').forEach(item => {

      item.addEventListener('input', () => {

        item.value = item.value.substr(0, 1).toUpperCase() + item.value.trim().replace(/[0-9]/g, '').substr(1).toLowerCase();
      });
    });

    let nameClient = document.querySelector('.input-name');
    let surnameClient = document.querySelector('.input-surname');
    let lastnameClient = document.querySelector('.input-lastname');

    let addContact = newClientWindow.querySelector('.add-contact');

    addContact.addEventListener('click', () => {

      newClientWindow.style.top = `calc(50% - ${newClientWindow.offsetHeight / 2}px)`;

      if (newClientWindow.offsetHeight >= innerHeight - 100) {

        newClientWindow.style.top = '10px';
      }

      addContacts(newClientWindow, '.form-add-new-client');

      newClientWindow.querySelectorAll('.group-contact').forEach((item, index) => {

        if (index == 9) {

          addContact.classList.add('add-contact-window--active');
        } else if (index < 9) {
          addContact.classList.remove('add-contact-window--active');
        }
      });
    });

    btnAddClient.addEventListener('click', () => {

      document.addEventListener('click', (e) => {

        let withinModalWindow = e.composedPath().includes(newClientWindow);
        let withinBtn = e.composedPath().includes(btnAddClient);

        if (!withinModalWindow && !withinBtn && newClientWindow.className.includes('modal-window--active')) {

          closeModalWindow(newClientWindow);
        }
      });

      document.querySelector('main').classList.add('window--active');

      newClientWindow.classList.toggle('modal-window--active');
    });

    formAddNewClient.addEventListener('submit', async (e) => {

      e.preventDefault();

      let loader = document.querySelector('.loader-save');

      loader.style.display = 'block';

      let arrContacts = [];

      formAddNewClient.querySelectorAll('.form-add-contact').forEach((item, index) => {

        let contact = {

          type: item.querySelector('select').value,
          value: item.querySelector('input').value,
        };

        arrContacts[index] = contact;
      });

      const response = await fetch('http://localhost:3000/api/clients', {

        method: 'POST',
          body: JSON.stringify ({
                  name: nameClient.value,
                  surname: surnameClient.value,
                  lastName: lastnameClient.value,
                  contacts: arrContacts,
                }),
          headers: {
                    'Content-Type': 'application/json',
                    }
      });

      if (String(response.status).startsWith('4')|| String(response.status).startsWith('5')) {

        validateForm(document.querySelector('.new-client-window'));
      }
      else{
        loader.style.display = 'none';
        location.reload();
      }
    });
  }

  function changeAndSaveClient (id, client) {

    document.querySelector('main').classList.add('window--active');

    let changeClientWindow = document.querySelector('.change-client-window');

    changeClientWindow.querySelectorAll('input').forEach(item => {

      item.addEventListener('input', () => {

        item.value = item.value.substr(0, 1).toUpperCase() + item.value.trim().replace(/[0-9]/g, '').substr(1).toLowerCase();
      });
    });

    changeClientWindow.classList.add('modal-window--active');
    changeClientWindow.id = id;

    changeClientWindow.style.top = `calc(50% - ${changeClientWindow.offsetHeight / 2}px)`;

    if (changeClientWindow.offsetHeight >= innerHeight - 100) {
      changeClientWindow.style.top = '10px';
    }

    changeClientWindow.querySelector('.svg-close').addEventListener('click', () => {

      let groupSelectInput = changeClientWindow.querySelector('.input-select');

      groupSelectInput.innerHTML = "";

      closeModalWindow();
    });

    changeClientWindow.querySelector('.cancel').addEventListener('click', () => {

      deleteClient(id);
    });

    let idClient = changeClientWindow.querySelector('.id-client');
    idClient.innerHTML = 'ID: ' + client.id.substr(8);

    let nameClient = changeClientWindow.querySelector('.input-name');
    nameClient.value = client.name;

    let surnameClient = changeClientWindow.querySelector('.input-surname');
    surnameClient.value = client.surname;

    let lastnameClient = changeClientWindow.querySelector('.input-lastname');
    lastnameClient.value = client.lastName;

    let contactsCount = client.contacts.length;

    if (contactsCount != 0) {

      client.contacts.forEach((contact, index) => {

        addContacts(changeClientWindow, '.form-change-client');

        changeClientWindow.style.top = `calc(50% - ${changeClientWindow.offsetHeight / 2}px)`;

        if (changeClientWindow.offsetHeight >= innerHeight - 100) {
          changeClientWindow.style.top = '10px';
        }

        changeClientWindow.querySelectorAll('.group-contact').forEach((item2, index2) => {

          if (index2 == index) {

            item2.querySelector('.select-add-contact').value = contact.type;
            item2.querySelector('.input-add-contact-field').value = contact.value;
          }
        });
      });
    }

    let formChangeClient = changeClientWindow.querySelector('.form-change-client');

    let data = new Date();
    let dataChange = addDate(data);

    let addContact = changeClientWindow.querySelector('.input-add-contact');

    addContact.addEventListener('click', () => {

      if (changeClientWindow.id == id) {

        if (changeClientWindow.querySelector('.input-select').innerHTML != "") {

          if (changeClientWindow.querySelector('.input-add-contact-field').value == "") {
            changeClientWindow.querySelector('.input-add-contact-field').closest;
          }
        }

        addContacts(changeClientWindow, '.form-change-client');
      }
    });

    formChangeClient.addEventListener('submit', async (e) => {

      e.preventDefault ();

      let loader = document.querySelector('.loader-save');

      loader.style.display = 'block';

      let arrContacts = [];

      formChangeClient.querySelectorAll('.form-add-contact').forEach((item, index) => {

        let contact = {

          type: item.querySelector('select').value,
          value: item.querySelector('input').value
        };

        arrContacts[index] = contact;
      });

      let response = await fetch (`http://localhost:3000/api/clients/${id}`, {

        method: 'PATCH',

        body: JSON.stringify ({
                name: nameClient.value,
                surname: surnameClient.value,
                lastName: lastnameClient.value,
                updatedAt: dataChange,
                contacts: arrContacts,
              }),

        headers: {
                'Content-Type': 'application/json',
                },
        });

      if (String(response.status).startsWith('4')|| String(response.status).startsWith('5')) {

        validateForm(document.querySelector('.change-client-window'));
      }
      else {
        loader.style.display = 'none';
        location.reload();
      }
    });
  }

  function validateForm (modalWindow) {

    modalWindow.querySelector('.error-message').innerHTML = 'Ошибка: новая модель организационной деятельности предполагает независимые способы реализации поставленных обществом задач!';

  }

  function deleteClient (id) {

    document.querySelector('main').classList.add('window--active');

    let deleteClientWindow = document.querySelector('.delete-client-window');

    deleteClientWindow.classList.add('modal-window--active');

    deleteClientWindow.style.top = `calc(50% - ${deleteClientWindow.offsetHeight / 2}px)`;

    deleteClientWindow.querySelector('.svg-close').addEventListener('click', () => {

      closeModalWindow();
    });

    deleteClientWindow.querySelector('.cancel').addEventListener('click', () => {

      closeModalWindow();
    });

    let inputDelete = deleteClientWindow.querySelector('.input-delete');

    inputDelete.addEventListener('click', async () => {

      const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'DELETE',
      });
      location.reload();
    });



  }

  function closeModalWindow () {

    document.querySelector('main').classList.remove('window--active');

    let groupSelectInput = document.querySelector('.input-select');

    groupSelectInput.innerHTML = "";

    let modalWindow = document.querySelectorAll('.modal-window');

    modalWindow.forEach(item => {

      item.classList.remove('modal-window--active');
    });
  }

  async function fillCleintsDB () {

    let loader = document.querySelector('.loader-container');

    loader.style.display = 'block';

    const response = await fetch('http://localhost:3000/api/clients');
    const answer = await response.json();

    if (response.status == 200) {

      answer.forEach (client => {

        loader.style.display = 'none';
        fillTable(client);
      });
    }
  }

  function addContacts(modalWindow, className) {

    let group = modalWindow.querySelector('.input-select');

    let formContact = document.querySelector('.add-contact-window-hidden');

    let newGroup = document.createElement('div');

    newGroup.innerHTML = formContact.innerHTML;

    newGroup.classList.add('group-contact');

    group.appendChild(newGroup);

    modalWindow.querySelectorAll('.input-add-contact-field').forEach(item => {

      let closedBlock = document.querySelector('.closed-block');

      let deleteContact = document.createElement('div');

      deleteContact.classList.add('closed-block');

      deleteContact.innerHTML = closedBlock.innerHTML;

      deleteContact.style.display = 'block';

      item.after(deleteContact);

      deleteContact.addEventListener('click', () => {

        deleteContact.closest(className).querySelector('.add-contact').classList.remove('add-contact-window--active');

        deleteContact.closest('.group-contact').remove();
      })

      item.addEventListener('input', () => {

        if (item.value != '') {

            let closedBlock = document.querySelector('.closed-block');

            let deleteContact = document.createElement('div');

            deleteContact.classList.add('closed-block');

            deleteContact.innerHTML = closedBlock.innerHTML;

            deleteContact.style.display = 'block';

            item.after(deleteContact);

            deleteContact.addEventListener('click', () => {

              deleteContact.closest(className).querySelector('.add-contact').classList.remove('add-contact-window--active');

              deleteContact.closest('.group-contact').remove();
            })
        }
      })
    })
  }

  function getWidhtElement (element) {

    let div = document.createElement('div');

    document.body.appendChild(div);

    div.style.visibility = 'hidden';
    div.style.position = 'absolute';
    div.style.zIndex = '-100'

    div.innerHTML = element.innerHTML;

    let width = div.offsetWidth;

    return width;
  }

  function addDate (str) {

    let date = new Date(str);

    let dd = date.getDate();
    let mm = date.getMonth();
    let hh = date.getHours();
    let min = date.getMinutes();

    dd < 10  ? dd = '0' + dd : dd;
    mm < 10  ? mm = '0' + (mm + 1) : mm + 1;
    hh < 10  ? hh = '0' + hh : hh;
    min < 10  ? min = '0' + min : min;


    let fullDate = dd + '.' + mm  + '.' + date.getFullYear();
    let time = hh + ':' + min;

    let newStr = `<span class='date'>${fullDate}</span> <span class='time'>${time}</span>`

    return newStr;
  }

  async function searchClient () {

    let response = await fetch(`http://localhost:3000/api/clients`);

    let answer = await response.json();

    let inputSearch = document.querySelector('.input-search');

    inputSearch.addEventListener('input', () => {

      if (inputSearch.value == "") {

        clearTable('trClient');
        answer.forEach(client => fillTable(client));

      } else {

        let timeout = setTimeout(() => {

          clearTable('trClient');
          answer.forEach (client => {

            let fullName = client.surname + ' ' + client.name + ' ' + client.lastName;

            if (client.id.includes(inputSearch.value) || fullName.includes(inputSearch.value)) {
              fillTable(client);
            }
          })
        }, 300)
      }
    })
  }

  async function sortClientsTable (criterion, client) {

    let response = await fetch('http://localhost:3000/api/clients');
    let answer = await response.json();

    if (client.classList.value.includes('arrow--active')) {

      if (criterion == 'id') {

        answer.sort((a, b) => a.id > b.id ? 1 : -1);
      } else if (criterion == 'fullName') {

        answer.sort((a, b) => (a.surname + ' ' + a.name + ' ' + a.lastName) > (b.surname + ' ' + b.name + ' ' + b.lastName) ? 1 : -1);
      } else  if (criterion == 'createdAt') {

        answer.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1)

      } else  if (criterion == 'updatedAt') {
        answer.sort((a, b) => a.updatedAt > b.updatedAt ? 1 : -1);
      }

      clearTable('trClient');

      answer.forEach(client => {
        fillTable(client);
      }
      )
    } else {
      if (criterion == 'id') {
        answer.sort((a, b) => a.id > b.id ? -1 : 1);
      } else if (criterion == 'fullName') {

        answer.sort((a, b) => (a.surname + ' ' + a.name + ' ' + a.lastName) > (b.surname + ' ' + b.name + ' ' + b.lastName) ? -1 : 1);
      } else  if (criterion == 'createdAt') {
        answer.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1);
      } else  if (criterion == 'updatedAt') {
        answer.sort((a, b) => a.updatedAt > b.updatedAt ? -1 : 1);
      }

      clearTable('trClient');

      answer.forEach(client => {

        fillTable(client);
      })
    }
  }

  function clearTable (trName) {

    let tr = document.querySelectorAll('tr');

    tr.forEach(item => {

      if (item.className == trName) {
        item.innerHTML = " ";
      }
    })
  }

  let thId = document.querySelector('.th-id');

  let thFullName = document.querySelector('.th-fullName');
  let thDateCreate = document.querySelector('.th-dateCreate');
  let thDateChange= document.querySelector('.th-dateChange');

  let svgArrow = document.querySelectorAll('.arrow');

  svgArrow.forEach((item, index) => {

    if (index == 0) {
      item.classList.toggle('arrow--active');
    }

    thId.addEventListener('click', () => {

      if (index == 0) {

        item.classList.toggle('arrow--active');
        sortClientsTable(thId.id, item);
      }
    })

    thFullName.addEventListener('click', () => {

      if (index == 1) {

        item.classList.toggle('arrow--active');
        let letters = document.querySelector('.letter');

        letters.innerHTML = letters.innerHTML.split('').reverse().join(' ');

        sortClientsTable(thFullName.id, item);
      }
    })

    thDateCreate.addEventListener('click', () => {

      if (index == 2) {

      item.classList.toggle('arrow--active');
      sortClientsTable(thDateCreate.id, item);
    }
    })

    thDateChange.addEventListener('click', () => {

      if (index == 3) {

      item.classList.toggle('arrow--active');
      sortClientsTable(thDateChange.id, item);
    }
    })
  })

  searchClient();
  fillCleintsDB();
  addClients();
})


