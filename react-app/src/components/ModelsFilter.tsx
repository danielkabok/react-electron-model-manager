import { useState } from 'react';

import { TagModel } from '../models/tagModel';

import { categoryTypes } from '../utils/constants';

import '../App.scss'


function ModelsFilter(props: { tags: TagModel[], doFilter: (sortOption: string, tagId?: number, categoryId?: number, keyword?: string) => void, noFilter: () => void }) {

	const [filterTag, setFilterTag] = useState<number | undefined>(undefined);
	const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);
	const [keyword, setKeyword] = useState<string>('');
	const [sortOption, setSortOption] = useState<string>('id_asc');

	const handleFilter = () => {
		props.doFilter(sortOption, filterTag, filterCategory, keyword);
	};

	const handleReset = () => {
		setFilterTag(undefined);
		setFilterCategory(undefined);
		setKeyword("");
		setSortOption("id_asc");
		props.noFilter();
	}

	return (
		<div className='modelFiltersContainer'>
			<div className='modelFilters'>

				<div>
					<span>Category:</span>
					<select
						value={filterCategory === undefined ? "" : filterCategory}
						onChange={(e) => setFilterCategory(e.target.value === "undefined" ? undefined : Number(e.target.value))}
					>
						<option value="undefined">None</option>
						{Object.entries(categoryTypes).map(([key, value]) => (
							<option key={key} value={key}>
								{value}
							</option>
						))}
					</select>
				</div>

				<div>
					<span>Tag:</span>
					<select
						value={filterTag === undefined ? "" : filterTag}
						onChange={(e) => setFilterTag(e.target.value === "undefined" ? undefined : Number(e.target.value))}
					>
						<option value="undefined">None</option>
						{props.tags.map(tag => (
							<option key={tag.id} value={tag.id}>
								{tag.name}
							</option>
						))}
					</select>
				</div>

				<div>
					<span>Keyword:</span>
					<input
						type="text"
						placeholder="Search model name"
						value={keyword}
						onChange={(e) => setKeyword(e.target.value)}
					/>
				</div>

				<div>
					<span>Order by:</span>
					<select
						value={sortOption}
						onChange={(e) => setSortOption(e.target.value)}
					>
						<option value="id_asc">ID Ascending</option>
						<option value="id_desc">ID Descending</option>
						<option value="name_asc">Name Ascending</option>
						<option value="name_desc">Name Descending</option>
					</select>
				</div>

			</div>
			<div className='modelFilterButtons'>
				<button onClick={handleReset}>
					<i className="reset"></i>
				</button>
				<button onClick={handleFilter}>
					<i className="search"></i>
				</button>
			</div>
		</div>
	)
}

export default ModelsFilter;