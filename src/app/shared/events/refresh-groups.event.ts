import { PubSubEvent } from './pub-sub-event';

export class RefreshGroupsEvent extends PubSubEvent<boolean> {
    // No implementation required
    public eventType = 'RefreshGroupsEvent';
}
