document.addEventListener( "DOMContentLoaded", function() {
	const csvUrl = "ajax/data.csv";

	const parserConfig = {
		download: true,
		header: true,
		skipEmptyLines: true,
		complete: function( results ) {
			buildTable( results.data, results.meta.fields );
		}
	};

	// eslint-disable-next-line no-undef
	Papa.parse( csvUrl, parserConfig );
} );

const buildTable = ( data, headers ) => {

	const table = document.getElementById( "csv-table" );
	const thead = document.createElement( "thead" );
	const headerRow = document.createElement( "tr" );

	// Build the headers
	headers.forEach( header => {
		const th = document.createElement( "th" );
		th.textContent = header;
		headerRow.appendChild( th );
	} );
	thead.appendChild( headerRow );
	table.appendChild( thead );

	// Build the body
	const tbody = document.createElement( "tbody" );
	data.forEach( row => {
		const tr = document.createElement( "tr" );
		headers.forEach( header => {
			const td = document.createElement( "td" );
			td.textContent = row[ header ] || "";
			tr.appendChild( td );
		} );
		tbody.appendChild( tr );
	} );
	table.appendChild( tbody );
};
