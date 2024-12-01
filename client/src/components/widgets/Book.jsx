import { useEffect } from 'react'
import { useDrag } from 'react-dnd';

    export function Book(props) {
        const { book_id, book, onClick } = props;

        const [{ isDragging }, drag] = useDrag({
            type: 'BOOK',
            item: { id: book_id },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        return (
            <img
                ref={drag}
                id={book_id}
                src={book.cover_link}
                alt={book.title}
                onClick={onClick}
                style={{ opacity: isDragging ? 0.5 : 1 }}
            />
        );
    }