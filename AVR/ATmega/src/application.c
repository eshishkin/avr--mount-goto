#include "usbdrv/usbdrv.h"

#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <avr/wdt.h>

#include "common.h"
#include "mount.h"
#include "queue.h"

#define TRANSMISSION_RATE 144 * 4
#define STEPS_PER_ROUND 400

volatile struct EQMount* mount;
TaskQueue* tasks;

USB_PUBLIC uchar usbFunctionSetup(uchar data[8]) {
	return 0; // do nothing for now
}


ISR(TIMER0_OVF_vect, ISR_NOBLOCK) {
}

void usbInitAndConnect() {
	wdt_enable(WDTO_1S); // enable 1s watchdog timer

	usbInit();
	
	usbDeviceDisconnect(); // enforce re-enumeration
	for(uchar i = 0; i < 250; i++) { // wait 500 ms
		wdt_reset(); // keep the watchdog happy
		_delay_ms(2);
	}
	usbDeviceConnect();
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
	
	usbInitAndConnect();
	tasks = queue_create();

	mount = createMount(STEPS_PER_ROUND, TRANSMISSION_RATE);
	
	
	while(1) {
		wdt_reset(); // keep the watchdog happy
		usbPoll();
		
		Task* task = tk_poll(tasks);
		// do something
		free(task);
	}
	
	return 0;
}