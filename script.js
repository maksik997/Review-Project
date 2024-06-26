'use strict';
document.addEventListener("DOMContentLoaded", () => main());

function main() {
    getReviews(); // load db

    const createButton = document.getElementById("create-button");
    createButton.addEventListener("click", () => openModal(Modals.Create));
    const reloadButton = document.getElementById("reload-button");
    reloadButton.addEventListener("click", () => getReviews());
    const createReviewButton = document.getElementById("create-review");
    createReviewButton.addEventListener("click", () => createReview());
    const deleteButton = document.getElementById("deleteButton");
    deleteButton.onclick = deleteReview;
    const modifyButton = document.getElementById("modifyButton");
    modifyButton.onclick = changeMode;
    const saveButton = document.getElementById("saveButton");
    saveButton.onclick = updateReview;
}

/* Modal funcs */
const Modals = Object.freeze({
    Reviews: 'review-modal',
    Create: 'add-modal'
});

function openModal(modalType, id = undefined) {
    const modal = document.getElementById(modalType);
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    if (id != undefined) {
        const reviewCard = document.getElementById(id.split('-')[0] + '-review-record');
        const title = reviewCard.querySelector(".card-title").textContent;
        modalTitle.textContent = title;
    
        fetch('./db/reviews.json').then(res => res.json())
            .then(data => { 
                const content = data.reviews.find(d => d.title == title).data;
                modalContent.innerHTML = '<pre>' + content + '</pre>';
            })
            .catch(err => console.error("Error encountered:", err));    
    }
    modal.style.display = 'block';

    const buttons = document.querySelectorAll("#review-modal div button");
    buttons.forEach(el => el.style.display = "inline-block");
    buttons[buttons.length - 1].style.display = "none";
}
function closeModal(modalType) {
    const modal = document.getElementById(modalType);
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    modal.style.display = 'none';
    modalTitle.textContent = '';
    modalContent.textContent = '';
}
function changeMode() { // For review modal
    // Create modify textarea
    const modifyTextarea = document.createElement("textarea");
    modifyTextarea.rows = 20;

    // Insert contents of the review into textarea
    const content = this.parentElement.parentElement.getElementsByTagName("pre")[0].textContent;
    modifyTextarea.textContent = content;

    // Clear contents of the review
    const modalContent = this.parentElement.parentElement.getElementsByTagName("p")[0];
    modalContent.innerHTML = "";
    modalContent.appendChild(modifyTextarea);

    // Hide not needed buttons
    this.style.display = "none";
    const buttons = this.parentElement.getElementsByTagName("button");

    buttons[0].style.display = "none";
    buttons[buttons.length - 1].style.display = "inline-block";
}

/* Db funcs */

async function createReview() {
    const title = document.getElementById("title-review").value;
    const content = document.getElementById("content-review").value;

    if (title.length == 0 || content.length == 0) {
        console.error("You should write something");
        return;
    }

    try {
        const res = await fetch('./db/reviews.json');
        const data = await res.json();
        
        if (data.reviews.map(d => d.title).includes(title)) {
            console.error("There is a record with specified title!");
            return;
        }

        data.reviews.push({
            "title": title,
            "data": content
        });

        const updatedData = JSON.stringify(data);

        fetch('http://localhost:3000/update', {
            method: "PUT",
            body: updatedData,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.ok)
                console.log("Updated successfully!");
            else 
                console.error("Task failed successfully");
        })
        .catch(err => console.error("Error encounterd: ", err));

        closeModal(Modals.Create);
        getReviews();

    } catch (err) {
        return console.error("Error encountered:", err);
    }
}

async function deleteReview() {
    const title = this.parentElement.classList == 0 ? this.parentElement.parentElement.getElementsByTagName("h2")[0].textContent : this.parentElement.getElementsByClassName("card-title")[0].textContent;

    try {
        const res = await fetch('./db/reviews.json');
        const data = await res.json();

        const reducedData = JSON.stringify({"reviews": data.reviews.filter(d => d.title != title)});

        fetch('http://localhost:3000/update', {
            method: "PUT",
            body: reducedData,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.ok) {
                console.log("Deleted successfully!");

                if (this.parentElement.classList == 0) {
                    closeModal(Modals.Reviews);
                }

                getReviews();
            } else 
                console.error("Couldn't delete record!");
        })
        .catch(err => console.error("Error encounterd: ", err));
    } catch (err) {
        console.error("Error encountered: ", err);
    }
}

async function updateReview() {
    const title = this.parentElement.parentElement.getElementsByTagName("h2")[0].textContent;
    const content = this.parentElement.parentElement.getElementsByTagName("textarea")[0].value;

    try {
        const res = await fetch('./db/reviews.json');
        const data = await res.json();

        const oldContent = data.reviews.filter(d => d.title == title)[0].data;

        if(oldContent != content) {
            const modifiedData = data.reviews.filter(d => d.title != title);
            modifiedData.push({ "title": title, "data": content });

            updateData(JSON.stringify({"reviews": modifiedData}))

            closeModal(Modals.Reviews);
        }
    } catch (err) {
        return console.error("Error encountered:", err);
    }
}

async function getReviews() {
    /* UI Elements */
    function createCard(data) {
        const text = data.data.length > 200 ? data.data.substring(0, 197) + "..." : data.data;
    
        const card = document.createElement('div');
        card.classList.add('card');
        card.id = data.title + "-review-record";
    
        const titleElement = document.createElement('div');
        titleElement.classList.add('card-title');
        titleElement.textContent = data.title;
    
        const contentElement = document.createElement('p');
        contentElement.classList.add('card-content');

        contentElement.innerHTML = text + ` <a href="#" id="${data.title}-link" onClick="openModal(Modals.Reviews, '${data.title}')">Read more...</a>`;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('button');
        deleteButton.textContent = "Delete"
        deleteButton.onclick = deleteReview;

        card.appendChild(titleElement);
        card.appendChild(contentElement);
        card.appendChild(deleteButton);
        

        return card;
    }
    
    function createCardList(title) {
        const listElement = document.createElement('li');
    
        const linkElement = document.createElement('a');
        linkElement.textContent = title;
        linkElement.href = "#" + title;
    
        listElement.appendChild(linkElement);
    
        return listElement;
    }

    const reviewsElement = document.getElementById("reviews");
    const reviewListElement = document.getElementById('review-list'); 

    reviewsElement.innerHTML = "";
    reviewListElement.innerHTML = "";

    try {
        const res = await fetch('./db/reviews.json');
        const data = await res.json();

        data.reviews.forEach(rev => {
            const card = createCard(rev);
            reviewsElement.appendChild(card);

            const listElement = createCardList(rev.title);
            reviewListElement.appendChild(listElement);
        });
    } catch (err) {
        return console.error("Error encountered:", err);
    }
};

async function updateData(data) {
    try {
        const res = await fetch('http://localhost:3000/update', {
            method: "PUT",
            body: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            console.log("Updated database!");

            getReviews();
        } else {
            console.error("Couldn't update record!");
        }
    } catch (err) {
        return console.error("Error encounterd: ", err);
    }
}