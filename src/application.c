#include <avr/io.h>
#include <avr/interrupt.h>  
#include <util/delay.h>

#include "common.h"
#include "mount.h"
#include "queue.h"

#define TRANSMISSION_RATE 144 * 4
#define STEPS_PER_ROUND 400

volatile struct EQMount* mount;
TaskQueue* tasks;

ISR(TIMER0_OVF_vect, ISR_NOBLOCK) {
	cli();
	if (mount->trackingEnabled) {
		track(mount);
	}
	sei();
}


int main(void) {

	//TIMSK = 1;
	//TIFR = 0;
	//TCCR0 = 1 << 2 | 1;
	//
	//DDRC = 255;
	//PORTC = 1;
	//
	//sei();

	tasks = queue_create();

	mount = createMount(STEPS_PER_ROUND, TRANSMISSION_RATE);
	
	
	while(1) {	
		Task* task = tk_poll(tasks);
		// do something
		free(task);
	}
	
	return 0; 
}