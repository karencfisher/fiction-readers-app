import { useState } from 'react';
import '../forms/BookInfo.css';

export function BookGrid(props) {
    const {books, getSelectedBook, countPages, currentPage, setCurrentPage} = props;

    function pageNavigate(e) {
        if (e.target.id === "back" && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
        else if (e.target.id === "forward" && currentPage < countPages) {
            setCurrentPage(currentPage + 1);
        }
    }

    return (
        <div>
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
            {countPages > 0 ? (
                <nav className="page-nav">
                    <span 
                        className="material-icons-outlined"
                        id="back"
                        onClick={pageNavigate}
                    >arrow_back_ios</span>
                    Page {currentPage} of {countPages}
                    <span 
                        className="material-icons-outlined"
                        id="forward"
                        onClick={pageNavigate}
                    >arrow_forward_ios</span>
                </nav>
            ) : (
                <></>
            )}
            <div className="book-grid">
                {books.length > 0 ? (
                    books.map((book, i) => (
                        <img className="book-cover" key={i} src={book.cover_link} alt={book.title} 
                            id={book.id} onClick={getSelectedBook} />
                    ))
                ) : (
                    <div className="book-noresults">
                        No search results
                    </div>
                )}
            </div>
        </div>
    )
}