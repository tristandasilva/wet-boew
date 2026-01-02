/**
 * @title WET-BOEW Tables - CSV data source
 * @overview Fetches CSV data from a URL and initializes wb-tables with it.
 */
( function( $, window, wb ) {
"use strict";

var componentName = "wb-tables-csv",
	selector = "table[data-wb-csv]",
	initEvent = "wb-init." + componentName,
	$document = wb.doc,

	init = function( event ) {
		var elm = wb.init( event, componentName, selector );

		if ( elm ) {
			var $elm = $( elm ),
				csvUrl = elm.getAttribute( "data-wb-csv" );

			fetch( csvUrl )
				.then( function( response ) {
					if ( !response.ok ) {
						throw new Error( "Failed to fetch CSV file from " + csvUrl + ": " + response.statusText );
					}
					return response.text();
				} )
				.then( function( csvText ) {
					var result = parseCSV( csvText );

					buildTable( elm, result.data, result.fields );

					$elm.addClass( "wb-tables" ).trigger( "wb-init.wb-tables" );
				} )
				.catch( function( e ) {
					console.error( e );
				} );
		}
	},

	buildTable = function( table, data, headers ) {
		var thead = document.createElement( "thead" ),
			headerRow = document.createElement( "tr" ),
			tbody = document.createElement( "tbody" );

		headers.forEach( function( header ) {
			var th = document.createElement( "th" );
			th.textContent = header;
			headerRow.appendChild( th );
		} );
		thead.appendChild( headerRow );
		table.appendChild( thead );

		data.forEach( function( row ) {
			var tr = document.createElement( "tr" );
			headers.forEach( function( header ) {
				var td = document.createElement( "td" );
				td.textContent = row[ header ] || "";
				tr.appendChild( td );
			} );
			tbody.appendChild( tr );
		} );
		table.appendChild( tbody );
	},

	// Parse CSV text into { fields, data } — fields is the header array,
	// data is an array of row objects keyed by header name.
	// Handles RFC 4180 quoting: quoted fields, embedded commas/newlines,
	// and escaped "" quotes. Values are not trimmed (matches Papa Parse).
	parseCSV = function( text ) {

		// Strip a UTF-8 byte-order mark if present, so the first header
		// name doesn't come through as "\uFEFFdate".
		if ( text.charCodeAt( 0 ) === 0xFEFF ) {
			text = text.slice( 1 );
		}

		var rows = [],
			row = [],
			field = "",
			inQuotes = false,
			i = 0,
			len = text.length,
			char;

		while ( i < len ) {
			char = text[ i ];

			if ( inQuotes ) {
				if ( char === "\"" ) {
					if ( text[ i + 1 ] === "\"" ) {
						field += "\"";  // escaped quote
						i += 2;
						continue;
					}
					inQuotes = false;
					i++;
					continue;
				}
				field += char;
				i++;
				continue;
			}

			if ( char === "\"" ) {
				inQuotes = true;
			} else if ( char === "," ) {
				row.push( field );
				field = "";
			} else if ( char === "\n" ) {
				row.push( field );
				rows.push( row );
				row = [];
				field = "";
			} else if ( char !== "\r" ) {  // ignore CR (handles CRLF)
				field += char;
			}
			i++;
		}

		// Flush the final field/row (files without a trailing newline).
		if ( field !== "" || row.length > 0 ) {
			row.push( field );
			rows.push( row );
		}

		// Drop fully empty lines
		rows = rows.filter( function( r ) {
			return !( r.length === 1 && r[ 0 ] === "" );
		} );

		if ( rows.length === 0 ) {
			return { fields: [], data: [] };
		}

		var fields = rows[ 0 ];
		var data = rows.slice( 1 ).map( function( r ) {
			var obj = {};
			fields.forEach( function( name, index ) {
				obj[ name ] = index < r.length ? r[ index ] : "";
			} );
			return obj;
		} );

		return { fields: fields, data: data };
	};

$document.on( "timerpoke.wb " + initEvent, selector, init );

wb.add( selector );

} )( jQuery, window, wb );
