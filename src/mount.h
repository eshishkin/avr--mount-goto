#ifndef MOUNT_H
#define MOUNT_H

#include <stddef.h>
#include "common.h"

#define ANGLE_MILLIS_IN_CIRCLE 1296000000

struct EQPosition {
	unsigned long ra;
	unsigned long dec;
};

enum Hemisphere {
	NORTH, SOUTH
};

typedef enum { false, true } bool;
	
struct EQMount {
	struct EQPosition position;
	enum Hemisphere hemispere;
	
	bool trackingEnabled;
	uint32_t transmissionRate;
	uint32_t angleMillisPerStep;
	uint32_t numberOfStepsPerDriveTurn;
	uint32_t numberOfStepsPerMountTurn;
	uint32_t trackingDelayBetweenSteps; 
};

struct EQMount* createMount(uint32_t numberOfStepsPerDriveTurn, uint32_t transmissionRate);
void initMount(struct EQMount* context, uint32_t numberOfStepsPerDriveTurn, uint32_t transmissionRate);

void track(struct EQMount* context);
void moveTo(struct EQMount* context, struct EQPosition next);

#endif