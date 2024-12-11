import { useDrop } from 'react-dnd';
import { Book } from './Book';
import './BookShelf.css';

export function BookShelf(props) {
    const {kind, books, title, onBookClick, onDrop, onSearchClick, shelfId} = props;

    const [{ isOver }, drop] = useDrop({
        accept: 'BOOK',
        drop: (item) => {
            onDrop(item.id, shelfId);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    console.log(books);

    return (
        <div className="shelf" data-kind={kind}>
            <div className="shelf-title">
                {title}
            </div>
            <div className="shelf-tray" 
                ref={onBookClick ? drop : null} 
                    style={{ backgroundColor: isOver ? 'lightgreen' : 'transparent'}}> 
                {books.length === 0? (
                    <div className="placeholder">
                        Nothing on your shelf yet!&nbsp;
                        {onSearchClick ? (
                            <span className="add-link" onClick={onSearchClick}>Add a book now</span>
                        ) : (
                            <></>
                        )}
                    </div>
                ) : (
                    books.map((book, i) => (
                        <Book key={i} book_id={book.book_id} book={book} 
                              onClick={onBookClick? onBookClick: null} />
                    ))
                )}
            </div>
        </div>        
    )
}