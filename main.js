//Global variables
var allMembers = []; // All members data for use on Congress113 page
var statistics = []; // All members data for use on Attendance & Loyalty pages

//----------------COMBINED FUNCTIONS----------------------------------------
// Onload 
function onload(){
    var members = data.results[0].members;// Should this be a global variable?
    allMembers = showMembers(members);// This has been created as global 
    var lines = allMembers;
    createRow(lines);
    copyrightDate();
} 
        
// Filter on click
function filterOnClick(){
    var lines = combineFilters();
    createRow(lines); 
    checkLinesEmpty(lines);
}

//Populate table data for Attendance Pages
function fillTablesAttendance(){
    var members = data.results[0].members;// Should this be a global variable?
    statistics = getStats(members);// This has been created as global 
    addGlanceData();
    var mostLeastData = sortAttendance(statistics);
    addMostLeastData(mostLeastData);
    copyrightDate();
}

//Populate tables data for Loyalty Pages
function fillTablesLoyalty(){
    var members = data.results[0].members;// Should this be a global variable?
    statistics = getStats(members);// This has been created as global 
    addGlanceData();
    var mostLeastData = sortLoyalty(statistics);
    addMostLeastData(mostLeastData);
    copyrightDate();
}


//-------------------INDIVIDUAL FUNCTIONS---------------------------------------

/***********************  CONGRESS113 PAGES  ***********************************/

//-------------------CREATE ARRAY OF OBJECTS WITH ALL THE DATA----------------------------------
// Gets data from the JSON 'members' and creates an array of objects(one for each member) with the properties: name, party, state, seniority, votes % and url.
function showMembers(members) {
    var members = data.results[0].members;
	for (var i = 0; i < members.length; i++) {	
        var middle = members[i].middle_name || ""; 
        var memberData = {
            name: members[i].first_name+" "+ middle +" "+members[i].last_name,
            party: members[i].party,
            state: members[i].state,
            seniority: members[i].seniority,
            votes: members[i].votes_with_party_pct+"%",
            url: members[i].url,
        };
        allMembers.push(memberData);
	}
    return allMembers;
}


//------------------CHECK WHICH CHECKBOXES ARE SELECTED----------------------------
//Determines which checkboxes have been selected from the three different party options.
function getCheckedBoxes() {
    var checked = []; // array that will store class names of the boxes which are checked eg checked=["D", "R"]
    var checkboxes = document.getElementsByTagName("input");  // gets all the input tags
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked){ // if checkbox is checked
                var ticked = checkboxes[i].getAttribute("class"); // get the class attribute
                checked.push(ticked); // add the class to the array
            }
        }
    return checked;
}   


//-----------------FILTER BY PARTY--------------------------------------------------
// Filters 'allMember' array, based on the value of the party field in each 'members' data and returns results which match the 'checked' checkboxes.
function filterByParty(checked,allMembers){
    var linesParty = []; // or the results of the Party filter
        for (var i = 0; i < allMembers.length; i++){
            if (checked.length === 1){ 
                if (allMembers[i].party == checked[0]){ 
                linesParty.push(allMembers[i]);
                }
            }
            else if (checked.length === 2){
                if (allMembers[i].party == checked[0] || allMembers[i].party == checked[1]){
                linesParty.push(allMembers[i]);
                }
            }
            else {
                linesParty.push(allMembers[i]);
                } 
            }
    return linesParty;
}


//---------------CHECK WHICH DROPDOWN IS SELECTED----------------------------------
//Determines which option has been selected from the dropdown menu for state.
function getSelected() {
    var option = document.getElementsByTagName("option");  // gets all the input tags
    for (var i = 0; i < option.length; i++){
        if (option[i].selected === true){ // if option selected
            var selected = option[i].getAttribute("class"); // get the class attribute
            return selected;
            //break; // then exit loop
        }
    }
} 


//-----------------FILTER BY STATE-------------------------------------------------
// Filters 'allMember' array, based on the value of the state field in each 'members' data and returns results which match the 'selected' option from the dropdown menu.
function filterByState(selected,allMembers){
    var linesState = [];  // For the results of the State filter
        if (selected === "default"){
            linesState = allMembers; //though this will cancel out any selection from first filter
        }
        else {
            linesState = []; // resetting linesState to fill it with filtered data
            for (var i = 0; i < allMembers.length; i++){
                if (allMembers[i].state === selected){
                    linesState.push(allMembers[i]); // though it will push data to lines which is already there.
                    }
                }
        } 
    return linesState;
}


//------------------COMBINE RESULTS OF BOTH FILTERS---------------------------------
// Combining results of both arrays to out put the lines required to build the table with createRow(). Inputs required are results of which checkboxes are 'checked' and which drop down option is 'selected', and their corresponding results from the filters 'linesParty' and 'linesState' and the 'common' values which are in BOTH filter results.
function combineFilters(){
    var checked = getCheckedBoxes();
    var selected = getSelected(); 
    var linesParty = filterByParty(checked,allMembers);
    var linesState = filterByState(selected,allMembers);
    var common = compare(linesParty,linesState);
    
    if (selected === "default" || selected === 0) { // If state is all or defult then use only results from linesParty  
        lines = linesParty;
    }
    else if (checked.length === 3 || checked.length === 0){ // If all or none checkbboxes selected - use only the linesState
        lines = linesState;
    }
    else {
        lines = getLines(common,linesState);//When both filters are being used return results which are common to both
    }
    return lines;
}
 

//------------------GET NAMES-------------------------------------------
//Make arrays with only the name field so that they can be compared using _.intersection. The argument 'arr' will take both the array linesParty and linesState when used in compare().
function getNames(arr){
    var names = [];
    for (var i = 0; i < arr.length; i++){
        var name = arr[i].name;
        names.push(name);
    }
    return names;  
}


//------------------COMPARE TO GET NAMES IN COMMON---------------------------------
//Checking which names are in both arrays: 'linesParty' and 'linesState', returns a list of names which appear in both arrays and therefore apply to both selected filters.
function compare(linesParty,linesState){
    var partyNames = getNames(linesParty);
    var stateNames = getNames(linesState);
    var common = _.intersection(partyNames, stateNames);
    return common;
}


//--------------------GET LINES IN COMMON-----------------------------------
// Takes names in 'common' array, checks which lines in 'linesState' have the same name and pushes to the lines. The results is used in the createRow().
function getLines(common,linesState){  
    lines = []
    for (var i = 0; i < common.length; i++){
        for (var j = 0; j < linesState.length; j++){
            if (linesState[j].name === common[i]){
                lines.push(linesState[j]);
            }
        }
    }
    return lines;
}


//--------------------CREATE TABLES USING LINES ARRAY-----------------------------
//Construct a table with the 'lines' of member data that should be included.
function createRow(lines) {
    document.getElementById("table_data").innerHTML= '';  //reset table each time
    for (var i = 0; i < lines.length; i++){ //loop through filtered members
        var properties = [lines[i].name,lines[i].party,lines[i].state,lines[i].seniority,lines[i].votes,]; //create variables for each field 
        var newRow = document.createElement("tr"); //Create new tableRow
        document.getElementById("table_data").appendChild(newRow); // Insert row into table by ID
            for (var k = 0; k < properties.length; k++){ //loop through each members and create new cells
                if (k == 0){
                    var newCell = document.createElement("td"); // Create cells within that row
                    newRow.appendChild(newCell); // add new cell to new row
                    var anchor = document.createElement("a"); // create an anchor tag
                    newCell.appendChild(anchor); // add anchor tags within new cell 
                    var newText = document.createTextNode(properties[k]); // Create text within row
                    anchor.appendChild(newText);  // add text within anchor
                    anchor.setAttribute("href", lines[i].url);
                    }
                else{
                    var newCell = document.createElement("td"); // Create cells within that row
                    newRow.appendChild(newCell); // add new cell to new row
                    var newText = document.createTextNode(properties[k]); // Create text within row
                    newCell.appendChild(newText);  // add text within new cell
                }
            }
        }  
}



//-------------------IF NO RESULTS FOUND------------------------------------------
function checkLinesEmpty(lines) {
    document.getElementById("message").innerHTML= '';  //reset warning message each time
    if (lines.length === 0){
        var newDiv = document.createElement("div");
        document.getElementById("message").appendChild(newDiv);
        newDiv.setAttribute('class', "warning");
        var newText = document.createTextNode("No results. Try using a broader filter");
        newDiv.appendChild(newText);
    }
}


/***********************  ATTENDANCE & LOYALTY PAGES  ***********************************/

//-------------------CREATE ARRAY OF STATS TO USE IN ATTENDANCE & LOYALTY TABLES----------------------------------
// Gets data from the JSON 'members' and creates an array of objects(one for each member) with the properties: name, party,  total_votes, missed_votes, missed_votes_pct, votes_with_party_pct)
function getStats(members) {
    var members = data.results[0].members;
    for (var i = 0; i < members.length; i++) {	
        var middle = members[i].middle_name || ""; 
        var memberStats = {
            name: members[i].first_name+" "+ middle +" "+members[i].last_name,
            party: members[i].party,
            total: members[i].total_votes,
            missed: members[i].missed_votes,
            missed_pct: members[i].missed_votes_pct,
            with_party_pct: members[i].votes_with_party_pct,
        };
        statistics.push(memberStats);
	}
    return statistics;
}


//---------------GET NUMBER FOR REPRESENTATIVES FOR EACH PARTY-------------
//Counts the total number of representatives for each party using the data in the array of objects: 'statistics'.
function getNoRepresentatives(statistics) {
    representatives = {"R": 0, "D": 0, "I": 0};
    for (var i = 0; i < statistics.length; i++){ //IMPROVE : Can I simplify this to remove if and simply put if find class which is the same as a propery of the object 'representatives' then add one to value of that property???
        if (statistics[i].party === "R"){
            representatives.R += 1;
        } 
        else if (statistics[i].party === "D"){
            representatives.D += 1;
        } 
        else {
            representatives.I += 1;
        }
    }
    return representatives;
}


//-----------HOW MANY MEMBERS ARE 10%----------------------------------------------
//This calculates to the nearest whole integer the number of people 10% refers to - so this can be used for obtaining the top and bottom 10% (House: 44 Senate: 10)
function tenPerCent(statistics) {
    return Math.round(statistics.length/10);
}


//------------CALCULATE AVERAGE PERCENTAGE OF MISSED & VOTES WITH PARTY---------------
//2 steps: 
//1. totalVotes takes the number of 'representatives' by party and the 'statistics' with all the data for each member and returns  an array ('sumVotes') of objects with the sum of percentage of votes (either missed or with party based on id of at a Glance table) for each party. IMPROVE: Could this be only 2 decimal places when necessary???
//2. Takes 'sumVotes' array and divides the sum total amounts for each party by the number of representatives in each party ('representatives') and returns a new array with the average percentages by party. It also rounds the results to a fixed 2 decimal places. 

//1. Get total sums
function totalVotes(statistics,representatives){ //IMPROVE - Is this better in two separate functions? (although this way just one output which can be used for both pages)
    var sumVotes = {"R": 0, "D": 0, "I": 0};
    if (document.getElementById("attendance")){
        for (i = 0; i < statistics.length; i++){
        if (statistics[i].party === "R"){
            sumVotes.R += parseFloat(statistics[i].missed_pct);
            } 
        else if (statistics[i].party === "D"){
            sumVotes.D += parseFloat(statistics[i].missed_pct);
            } 
        else {
            sumVotes.I += parseFloat(statistics[i].missed_pct);
            }
        } 
    } 
    else {
        for (i = 0; i < statistics.length; i++){
        if (statistics[i].party === "R"){
            sumVotes.R += parseFloat(statistics[i].with_party_pct);
            } 
        else if (statistics[i].party === "D"){
            sumVotes.D += parseFloat(statistics[i].with_party_pct);
            } 
        else {
            sumVotes.I += parseFloat(statistics[i].with_party_pct);
            }
        } 
     } 
     return sumVotes;
}

//2. Divide total 'sumVotes' by total no. of 'representatives' (per party), and also add average values for all parties, then round to 2 decimal places
function aveVotes(sumVotes,representatives){
    var percentages = [(sumVotes.R/representatives.R).toFixed(2), (sumVotes.D/representatives.D).toFixed(2), (sumVotes.I/representatives.I).toFixed(2), ((sumVotes.R+sumVotes.D+sumVotes.I)/(representatives.R+representatives.D+representatives.I)).toFixed(2)]; //Calculate overall ave percentages
    return percentages;
}


//--------------------AT A GLANCE TABLE DATA-----------------------------
//Fills in the At a Glance table data with relevant data 'statistics'. This function is used for all 4 instances of the table (Attendance & Loyalty, House & Senate)
function addGlanceData() {
    var representatives = getNoRepresentatives(statistics);
    var sumVotes = totalVotes(statistics,representatives);
    //var sumMissed = totalMissedVotes(statistics,representatives);
    var percentages = aveVotes(sumVotes,representatives);
    var percentages2 = [percentages[0],percentages[1],percentages[2],"ave percent"];
    var parties = ["Republican","Democrat","Independent", "Total"];
    var representatives2 = [representatives.R,representatives.D,representatives.I, statistics.length];
    for (var i = 0; i < parties.length; i++){ //loop through filtered members
        var newRow = document.createElement("tr"); //Create new tableRow
        document.getElementById("glance").appendChild(newRow); // Insert row into table by ID
        newRow.insertCell(-1).innerHTML = parties[i];  //-1 inserts each cell at the end of the row
        newRow.insertCell(-1).innerHTML = representatives2[i];
        newRow.insertCell(-1).innerHTML = percentages[i]+'%';
        }  
}


//------------SORT ATTENDANCE----------------------
// Takes an array (statistics) and sorts it into order based on missed percentage of votes ('missed_pct'). Orders statistics from mostEngaged (10% with lowest 'missed_pct') to the leastEngaged (10% with highest 'missed_pct').Outputs an array ('mostLeastData') which can be used top fill in the tables and contains the 2 arrays for 'leastEngaged' and ' mostEngaged'.
function sortAttendance(statistics) {
    statistics.sort(function(a,b){return b.missed_pct - a.missed_pct}); //sorts lowest->highest('Least' Tables)
    var leastEngaged = statistics.slice(0,tenPerCent(statistics));// first 10% of array (corresponds to bottom 10%)
    addExtraPeople(leastEngaged); //Add anyone with same results as last of 10%
    
    statistics.sort(function(a,b){return a.missed_pct - b.missed_pct}); //sort highest->lowest('Most' Tables)
    var mostEngaged = statistics.slice(0,tenPerCent(statistics)); //first 10% of array (corresponds to top 10%)
    addExtraPeople(mostEngaged); //Add anyone with same results as last of 10%
    
    var mostLeastData = [];
    mostLeastData.push(leastEngaged, mostEngaged); //Group Most and Least results in one array
    return mostLeastData;
}


//------------SORT LOYALTY----------------------
// Takes an array (statistics) and sorts it into order based on percentage of votes with ('with_party_pct'). Orders statistics from mostLoyal (10% with highest 'with_party_pct') to the leastLoyal (10% with lowest 'with_party_pct').Outputs an array ('mostLeastData') which can be used top fill in the tables and contains the 2 arrays for 'leastLoyal' and ' mostLoyal'.
function sortLoyalty(statistics) {  
    statistics.sort(function(a,b){return a.with_party_pct - b.with_party_pct}); //sorts lowest->highest('Least' Tables)
    var leastLoyal = statistics.slice(0,tenPerCent(statistics)); // first 10% of array (corresponds to bottom 10%)
    addExtraPeople(leastLoyal); //Add anyone with same results as last of 10%
    
    statistics.sort(function(a,b){return b.with_party_pct - a.with_party_pct}); //sort highest->lowest('Most' Tables)
    var mostLoyal = statistics.slice(0,tenPerCent(statistics)); //first 10% of array (corresponds to top 10%)
    addExtraPeople(mostLoyal); //Add anyone with same results as last of 10%
    var mostLeastData = []; 
    
    mostLeastData.push(leastLoyal, mostLoyal); //Group Most and Least results in one array
    return mostLeastData;
}


// ---------DECIDE IF NEED TO INLCUDE EXTRA PEOPLE IN THE MOST & LEAST TABLES--------------
function addExtraPeople(arr){
    var last = statistics[tenPerCent(statistics)-1];
    for (var i = 0; i < statistics.length-tenPerCent(statistics); i++){ //length needs to be for total minus the 10%
        var next = statistics[tenPerCent(statistics)+i];
        if (last.with_party_pct === next.with_party_pct){ 
            arr.push(next);
        }
    }
    return arr;
}



//-----------------POPULATE MOST AND LEAST TABLES-------------------------
//Use the arrays 'mostLeastData' which will either have attendance or loyalty data (as obtained from sortAttendance and sortLoyalty functions). This function is used for all 4 instances of the table (Attendance & Loyalty, House & Senate).
function addMostLeastData(mostLeastData) {
    var least = mostLeastData[0];
    var most = mostLeastData[1];
    for (var i = 0; i < most.length; i++){ //loop through filtered members
        var newRow = document.createElement("tr"); //Create new tableRow
        if (document.getElementById("mostA")){
            document.getElementById("mostA").appendChild(newRow); // Insert row into table by ID
            newRow.insertCell(-1).innerHTML = most[i].name;  //-1 inserts each cell at the end of the row
            newRow.insertCell(-1).innerHTML = most[i].missed;
            newRow.insertCell(-1).innerHTML = most[i].missed_pct+'%';
            }
        else {
            document.getElementById("mostL").appendChild(newRow); // Insert row into table by ID
            newRow.insertCell(-1).innerHTML = most[i].name;  //-1 inserts each cell at the end of the row
            newRow.insertCell(-1).innerHTML = most[i].total;
            newRow.insertCell(-1).innerHTML = most[i].with_party_pct+'%';
            }
        }
    for (var j = 0; j < least.length; j++){ //loop through filtered members
        var newRow = document.createElement("tr"); //Create new tableRow
        if (document.getElementById("leastA")){
            document.getElementById("leastA").appendChild(newRow); // Insert row into table by ID
            newRow.insertCell(-1).innerHTML = least[j].name;  //-1 inserts each cell at the end of the row
            newRow.insertCell(-1).innerHTML = least[j].missed;
            newRow.insertCell(-1).innerHTML = least[j].missed_pct+'%';
            }
        else {
            document.getElementById("leastL").appendChild(newRow); // Insert row into table by ID
            newRow.insertCell(-1).innerHTML = least[j].name;  //-1 inserts each cell at the end of the row
            newRow.insertCell(-1).innerHTML = least[j].total;
            newRow.insertCell(-1).innerHTML = least[j].with_party_pct+'%';
            }
        }  
}


//----------------AUTOFILL DATE IN FOOTER----------------------------------
//Add copyright and current year to Footer
function copyrightDate(){
    var today = new Date(); 
    var year = today.getFullYear(); 
    document.getElementById("footer").innerHTML = "&copy; Copyright TGIF " + year + " | All Rights Reserved";
}








    



