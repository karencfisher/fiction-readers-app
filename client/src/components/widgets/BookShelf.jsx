import { useState, useEffect } from 'react';
import './BookShelf.css';

export function BookShelf(props) {
    const {kind, books, title} = props;

    return (
        <div className="shelf" id={kind}>
            <div className="shelf-title">
                {title}
            </div>
            <div className="shelf-tray">
                {books.map((book, i) => (
                    <img key={i} src={book.cover_link} alt={book.title}></img>
                ))}
            </div>
        </div>        
    )
}