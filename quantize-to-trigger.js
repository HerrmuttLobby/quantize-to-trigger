/** 

 * Herrmutt Lobby • Minimun Note length js 0.1
 * (c) Herrmutt Lobby 2013 • herrmuttlobby.com
 * This code is distributed under a 
 * Creative Commons : Attribution, Share Alike, No-commercial Licence
 *
 * INPUT  : list [ note, velocity ] - buffers input messages
 * OUTPUT : list [ note, velocity, duration ] - outputs when trigger message is received
 *
 * MADE TO BE USED WITHIN the JS object of MAX4LIVE or MAX/MSP or in PureData 
 * with the jj object of the 
 * PDJ external (http://www.le-son666.com/software/pdj/) 

**/

// queue of notes waiting to be dispatched
var queue = [];

// Fetches "Trigger note" number via script name
function get_trigger_note() {
	return parseInt( this.patcher.getnamed( 'trigger_note' ).getvalueof(), 10 );
}

function get_output_at_trigger_vel() {
	return this.patcher.getnamed( 'output_at_trigger_vel' ).getvalueof();
}

function list( note, velocity ) {

	// Gets trigger note value via "script name"
	if( note == get_trigger_note() ) {
		// ignoring the note off so far
		if( velocity === 0 ) return;

		return flush_notes( velocity );
	}

	// save note
	if( velocity > 0 ) {
		queue.push( { 
			note     : note, 
			velocity : velocity,
			on_time  : ( new Date() ).getTime(),
			off_time : null
		} );
	} 
	// search for corresponding note and set duration
	else {
		for( var i = 0; i < queue.length; i++ ) {
			if( queue[i].note == note ) {
				// TODO: is getTime() same as Date.now() ?
				queue[i].off_time = ( new Date() ).getTime();
				queue[i].duration = queue[i].off_time - queue[i].on_time;
			}
		}
	}

}

/** output all notes from the queue **/
function flush_notes( velocity ) {
	for( var i = 0; i < queue.length; i++ ) {
		if( get_output_at_trigger_vel() == 1 ) {
			queue[i].velocity = velocity;
		}
		outlet( 0, [ queue[i].note, queue[i].velocity, queue[i].duration ] );
	}

	free();
}

/**
	Generic methods
 **/

function free() {
	queue = [];
}

function bang() {
	if( DEBUG ) post( "bang output all notes\n" );

	flush_notes();
}

/**
	Improving javascript timing
	@see http://cycling74.com/docs/max5/vignettes/js/jsthreading.html
 **/

bang.immediate = 1;
list.immediate = 1;
flush_notes.immediate = 1;