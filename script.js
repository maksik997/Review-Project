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
}
function closeModal(modalType) {
    const modal = document.getElementById(modalType);
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    modal.style.display = 'none';
    modalTitle.textContent = '';
    modalContent.textContent = '';
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
        
        card.appendChild(titleElement);
        card.appendChild(contentElement);
    
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
