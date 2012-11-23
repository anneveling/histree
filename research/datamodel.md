
Data model setup
======

HistoryNode:
<code>
{
	id: "12345434",
	timestamp: 12343443, //ms since epoch

	windowId: 41,
	tabId: 236,

	url: "http://bla.com",
	title: "nice"
	//favicon: ".ico"
	//snapshot

	parentId: "3434" //can be null
	childrenIds: ["343","34"]
}
</code>

key:
* windowid
* tab id


<code>
HistreeTab: {
	key: windowid+"-"+tabid
	currentEventId: 12343434

}
</code>
