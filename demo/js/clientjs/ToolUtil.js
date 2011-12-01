/**
 * ToolUtil
 * This Class implements universal tools to handle util functions
 */
ToolUtil = {};
/**
 * This method used to be get the 
 */
ToolUtil.subTimes = function(Ftime,Ttime){
	var dtime = (Ttime.getTime() - Ftime.getTime())/1000;
	var returnVal = "";
	if(dtime<60){//second
		returnVal = dtime + client.UNIT.TIME_UNIT.SECOND;
	}else if(dtime>=60 && dtime<60*60){//minute
	
		returnVal = Math.round(dtime/60) + client.UNIT.TIME_UNIT.MINUTE;
		
	}else if(dtime>=60*60 && dtime<60*60*24){//hour
	
		returnVal = Math.round(dtime/(60*60)) + client.UNIT.TIME_UNIT.HOUR;
		
	}else if(dtime>=60*60*24 && dtime<60*60*24*7){//day
	
		returnVal = Math.round(dtime/(60*60*24)) + client.UNIT.TIME_UNIT.DAY;
		
	}else if(dtime>=60*60*24*7 && dtime<60*60*24*30){//week
	
		returnVal = Math.round(dtime/(60*60*24*7)) + client.UNIT.TIME_UNIT.WEEK;
		
	}else if(dtime>=60*60*24*30 && dtime<60*60*24*30*6){//month
	
		returnVal = Math.round(dtime/(60*60*24*7*4)) + client.UNIT.TIME_UNIT.MONTH;
		
	}else if(dtime>=60*60*24*30*6 && dtime<60*60*24*30*6*12){//half year
	
		returnVal = client.UNIT.TIME_UNIT.HALFYEAR;
		
	}else if(dtime>=60*60*24*30*6*12){//year
	
		returnVal = Math.round(dtime/(60*60*24*30*6*12)) + client.UNIT.TIME_UNIT.YEAR;
	}
	return returnVal;
};