import { useState } from 'react';


const SortableTablePage = ({Component}) => {

	const [sortDirection, setSortDirection] = useState('asc');
	const [sortBy, setSortBy] = useState('');

	const onSort = (property) => {
		const isAsc = sortBy === property && sortDirection === 'asc';
		setSortDirection(isAsc ? 'desc' : 'asc');
		setSortBy(property);
	};

	const descendingComparator = (a, b, orderByFunc) => {
		if (orderByFunc(b) < orderByFunc(a)) {
		  return -1;
		}
		if (orderByFunc(b) > orderByFunc(a)) {
		  return 1;
		}
		return 0;
	};

	const getComparator = (order, orderByFunc) => {
		return order === 'desc'
		  ? (a, b) => descendingComparator(a, b, orderByFunc)
		  : (a, b) => -descendingComparator(a, b, orderByFunc);
	};

	const doSort = (list, order, orderByFunc) => {
		return list.sort(getComparator(order, orderByFunc));
	};

	const disableSort = () => {
		setSortBy('');
	};

    return <>
        <Component onSort={onSort}
                    doSort={doSort}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    disableSort={disableSort}
        />
    </>
}


export default SortableTablePage;