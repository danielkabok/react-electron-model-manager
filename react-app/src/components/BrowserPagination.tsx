import ReactPaginate from 'react-paginate';

import '../App.scss';


function BrowserPagination(props: {
    pageCount: number,
    changePage: ({ selected }: { selected: number }) => void
}) {
    return (
        <>
            {props.pageCount > 1 ?
                <ReactPaginate
                    previousLabel={<i className="angle-left"></i>}
                    nextLabel={<i className="angle-right"></i>}
                    pageCount={props.pageCount}
                    onPageChange={props.changePage}
                    containerClassName={'pagination'}
                    previousLinkClassName={'pagination__link'}
                    nextLinkClassName={'pagination__link'}
                    disabledClassName={'pagination__link--disabled'}
                    activeClassName={'pagination__link--active'}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={2}
                />
                : null}
        </>
    );
}

export default BrowserPagination;