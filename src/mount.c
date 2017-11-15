/*
 * mount.c
 *
 * Created: 15.11.2017 20:45:15
 *  Author: Eugene
 */ 

#include "mount.h"


void initMount(struct EQMount* context, uint32_t numberOfStepsPerDriveTurn, uint32_t transmissionRate) {
	context->hemispere = NORTH;
	context->trackingEnabled = false;
	
	context->transmissionRate = transmissionRate;
	context->numberOfStepsPerDriveTurn = numberOfStepsPerDriveTurn;
	context->numberOfStepsPerMountTurn = numberOfStepsPerDriveTurn * transmissionRate;
	context->trackingDelayBetweenSteps = MILLISECONDS_IN_SIDERAL_DAY / context->numberOfStepsPerMountTurn;
	context->angleMillisPerStep = ANGLE_MILLISECONDS_IN_CIRCLE / context->numberOfStepsPerMountTurn;
}

struct EQMount* createMount(uint32_t numberOfStepsPerDriveTurn, uint32_t transmissionRate) {
	struct EQMount* mount = malloc(sizeof (struct EQMount));
	initMount(mount, numberOfStepsPerDriveTurn, transmissionRate);
	return mount;
}

void track(struct EQMount* mount) {
	struct EQPosition next;
	next.dec = mount->position.dec;
	next.ra = mount->position.ra + mount->hemispere == NORTH ? mount->angleMillisPerStep : -mount->angleMillisPerStep;
	
	moveTo(mount, next);
}

void moveTo(struct EQMount* mount, struct EQPosition next) {
	mount -> position.ra = next.ra;
	mount -> position.dec = next.dec;
	// call driver
}

