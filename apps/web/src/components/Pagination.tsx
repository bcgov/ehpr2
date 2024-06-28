import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Option } from './form';
import { DEFAULT_PAGE_SIZE } from './admin';

export interface PageOptions {
  pageSize: number;
  pageIndex: number;
  total: number;
}

export interface PaginationProps {
  pageOptions: PageOptions;
  onChange: (options: PageOptions) => void;
}

const PAGE_SIZES = [5, 10, 25, 50];

export const Pagination = (props: PaginationProps) => {
  const {
    pageOptions: { pageSize, pageIndex, total },
    onChange,
  } = props;

  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(DEFAULT_PAGE_SIZE);

  const numOfPages = Math.ceil(total / pageSize);

  const pageSizeOptions = PAGE_SIZES.map(size => ({ value: size }));
  const pageListOptions = Array.from(Array(numOfPages).keys()).map(i => ({ value: i + 1 }));

  const startIndex = (pageIndex - 1) * pageSize + 1;
  const start = startIndex > total ? 0 : startIndex;
  const end = pageIndex * pageSize > total ? total : pageIndex * pageSize;

  const goToPage = (pgIndex: number) => {
    onChange({ pageSize, pageIndex: pgIndex, total });
  };

  const changePageSize = (pgSize: number) => {
    onChange({ pageSize: pgSize, pageIndex, total });
  };

  useEffect(() => {
    setCurrentPageSize(pageSize);
    setCurrentPage(pageIndex);
  }, [pageSize, pageIndex]);

  return (
    <div className='flex flex-row w-full bg-white text-bcBlack border-b border-t border-l'>
      <div className='text-sm py-4'>
        <span className='pl-6 mr-3'>Items per page: </span>
      </div>
      <div className='px-3 text-sm my-auto'>
        <select
          aria-label='items per page'
          name='page-size'
          onChange={e => changePageSize(+e.target.value)}
          value={currentPageSize}
        >
          {pageSizeOptions.map((o: { value: number }) => (
            <Option key={o.value} label={String(o.value)} value={String(o.value)} />
          ))}
        </select>
      </div>
      <div className='text-sm pl-3 p-4 border-r border-l'>
        <span>
          {start} - {end} of {total} items
        </span>
      </div>
      <div className='flex flex-row grow justify-end'>
        <div className='px-3 pt-4 border-l border-r h-100 text-sm'>
          <select
            aria-label='page select'
            name='page-list'
            onChange={e => goToPage(+e.target.value)}
            value={currentPage}
          >
            {pageListOptions.map((o: { value: number }) => (
              <Option key={o.value} label={String(o.value)} value={String(o.value)} />
            ))}
          </select>
        </div>
        <div className='text-sm p-4'>of {numOfPages} pages</div>
        <button
          aria-label='previous page'
          className='p-3 border-l'
          onClick={() => goToPage(pageIndex - 1)}
          disabled={pageIndex === 1}
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className={`${pageIndex === 1 ? 'opacity-50' : ''} h-6 w-6`}
          />
        </button>
        <button
          aria-label='next page'
          className='p-3 border-l border-r'
          onClick={() => goToPage(pageIndex + 1)}
          disabled={pageIndex === numOfPages || numOfPages === 0}
        >
          <FontAwesomeIcon
            icon={faArrowRight}
            className={`${
              pageIndex === numOfPages || numOfPages === 0 ? 'opacity-50' : ''
            } h-6 w-6`}
          />
        </button>
      </div>
    </div>
  );
};
