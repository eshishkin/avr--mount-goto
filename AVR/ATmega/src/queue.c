/*
 * queue.c
 *
 * Created: 16.11.2017 20:49:28
 * Author: Eugene
 */ 

#include "common.h"
#include "queue.h"

QueueItem* item_create();
 
TaskQueue* queue_create() {
	TaskQueue* queue = malloc(sizeof(TaskQueue));
	queue->first = NULL;
	queue->last = NULL;
	return queue;
}

void queue_free(TaskQueue* queue) {
	if (queue == NULL) {
		return;
	}
	
	while (queue->first) {
		QueueItem* item = queue->first;
		queue->first = item->next;
		
		free(item->task);
		free(item);
	}
	free(queue);
}

void tk_publish(TaskQueue* queue, Task* task) {
	if (queue == NULL) {
		return;
	}
	
	QueueItem* item = item_create();
	item->task = task;
	
	if (queue->first == NULL) {
		queue->first = item;
		queue->last = item;
	} else {
		item->next = NULL;
		queue->last->next = item;
		queue->last = item;
	}
}

Task* tk_poll(TaskQueue* queue) {
	if (queue == NULL) {
		return NULL;
	}
	
	if (!queue->first) {
		return NULL;
	}		

	QueueItem* item = queue->first;
	queue->first = item->next;
	
	if (queue->first == NULL) queue->last = NULL;
	
	Task* task = item->task;
	
	free(item);
	
	return task;
}


QueueItem* item_create() {
	QueueItem* item = malloc(sizeof(QueueItem));
	item->task = NULL;
	item->next = NULL;
	return item;
}