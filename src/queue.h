/*
 * queue.h
 *
 * Created: 16.11.2017 20:43:08
 * Author: Eugene
 */ 

#ifndef QUEUE_H_
#define QUEUE_H_

typedef struct _task {
	int type;	
} Task;

typedef struct _queue_item {
	Task* task;
	struct _queue_item* next;
} QueueItem;

typedef struct _task_queue {
	QueueItem* first;
	QueueItem* last;
} TaskQueue;

TaskQueue* queue_create(); 
void queue_free(TaskQueue* queue);

void tk_publish(TaskQueue* queue, Task* task);
Task* tk_poll(TaskQueue* queue);

#endif /* QUEUE_H_ */