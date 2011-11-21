/**
 * GlobalEvent
 * This Class used to maintain global events
 */
GlobalEvent = {};
_.extend(GlobalEvent,Backbone.Events);

client.EVENTS.USER_REFRESH = "user_fresh";

client.EVENTS.POPUP_CLOSE = "popup_close";