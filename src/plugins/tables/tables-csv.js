document.addEventListener( "DOMContentLoaded", function() {

	// Find all "instances" of tables with CSV data source
	const csvTables = document.querySelectorAll( "table[data-wb-csv]" );

	// For each table, fetch and parse the CSV data
	csvTables.forEach( table => {

		const csvUrl = table.getAttribute( "data-wb-csv" );
		const parserConfig = {
			download: true,
			header: true,
			skipEmptyLines: true,
			complete: function( results ) {
				buildTable( table, results.data, results.meta.fields );
			}
		};

		// eslint-disable-next-line no-undef
		Papa.parse( csvUrl, parserConfig );
	} );
} );

const buildTable = ( table, data, headers ) => {

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

	console.log( data, headers );

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
