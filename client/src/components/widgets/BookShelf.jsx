import { useState, useEffect } from 'react';
import './BookShelf.css';

export function BookShelf(props) {
    const {kind, books, title, onclick, addBook} = props;

    return (
        <div className="shelf" data-kind={kind}>
            <div className="shelf-title">
                {title}
            </div>
            <div className="shelf-tray">
                {books.length === 0? <div className="placeholder">
                    Nothing on your shelf yet!&nbsp;
                    <span className="add-link" onClick={addBook}>Add a book now</span>
                </div>: <div></div>}
                {books.map((book, i) => (
                    <img key={i} src={book.cover_link} alt={book.title} id={book.book_id}
                         onClick={onclick? onclick: null}></img>
                ))}
            </div>
        </div>        
    )
}