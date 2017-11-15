#include <avr/io.h>
#include <avr/interrupt.h>  
#include <util/delay.h>

#include "common.h"
#include "mount.h"

#define TRANSMISSION_RATE 144 * 4
#define STEPS_PER_ROUND 400

volatile struct EQMount* mount;

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

	mount = createMount(STEPS_PER_ROUND, TRANSMISSION_RATE);
	
	
	while(1) {	
	}
	
	return 0; 
}