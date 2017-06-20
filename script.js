"use strict";
$(document).ready(function(){

    //app variables
    var teamData = [], map = {}, willowTree={}, counter = 0, clickCounter = 1, $body=$('body');

    /*
       This method is for fetching questions for know the name type
    */
    willowTree.getQuestionsPool = function(data){
        var pool = [];
        var question = {};
        for(var i=0;i<data.length;i++){
            question.query = 'who is '+data[i].firstName+' '+data[i].lastName+'?';
            question.answer = data[i].id;
            question.options = willowTree.generateOptions(data[i].id);
            pool.push(question);
            question = {};
        }
        return pool;
    };

    /*
       This method is for generating options for know the name type questions
    */
    willowTree.generateOptions = function(id){
        var options = [];
        var headshot = {};
        headshot.id = map[id].headshot.id;
        headshot.url = map[id].headshot.url;
        options.push(headshot);
        for(var i=1;i<teamData.length;i++){
            headshot = {};
            var index = Math.floor(Math.random()*teamData.length);
            if(teamData[index].headshot.id == map[id].headshot.id){
                continue;
            }
            headshot.id = teamData[index].headshot.id;
            headshot.url = teamData[index].headshot.url;
            options.push(headshot);
            if(options.length === 5){
                break;
            }
        }
        return _.shuffle(options);
    };

    /*
       This method is for fetching questions for know the snap type
    */
    willowTree.getQuestionsPoolForSnaps = function(data){
        var pool = [];
        var question = {};
        for(var i=0;i<data.length;i++){
            question.query = data[i].headshot.url;
            question.answer = data[i].id;
            question.options = willowTree.generateOptionsForSnaps(data[i].id);
            pool.push(question);
            question = {};
        }
        return pool;
    };

    /*
       This method is for generating options for know the snap type questions
    */
    willowTree.generateOptionsForSnaps = function(id){
        var options = [];
        var option = {};
        option.name = map[id].firstName+' '+map[id].lastName;
        option.id = map[id].headshot.id;
        options.push(option);
        for(var i=1;i<teamData.length;i++){
            option = {};
            var index = Math.floor(Math.random()*teamData.length);
            if(teamData[index].headshot.id == map[id].headshot.id){
                continue;
            }
            option.name = teamData[index].firstName+' '+teamData[index].lastName;
            option.id = teamData[index].headshot.id;
            options.push(option);
            if(options.length === 5){
                break;
            }
        }
        return _.shuffle(options);
    };

   /* Configure data source API url*/
    var endPoint = Backbone.Collection.extend({
        url: 'https://willowtreeapps.com/api/v1.0/profiles/'
    });

    var dataSource = new endPoint();

    /* Make http get request using backbone's fetch method*/
    dataSource.fetch({
        success:function(data_arr){
            var data = data_arr.models[0].attributes;
            teamData = data.items;
            _.each(data.items, function(item, index, items) {
                map[item.id] = item;
            });
            willowTree.renderQuestion(willowTree.getQuestionsPool(teamData)[0]);
        },
        error: function(){
            /* Display error message in case of any http error */
            $("#primary-content").html('<div class="alert alert-danger" role="alert">There is a technical problem connecting to the data source now. Please try again later.</div>');
        }
    });

    /*
       This method is for rendering know the name type question template
       using underscore js _template functionality
    */
    willowTree.renderQuestion = function(data){
        var template = _.template('<div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title"><strong><%= query%></strong></h3></div><div class="panel-body"><% _.each(options, function (option) { %><img id="<%= option.id %>" class="<%= answer%>" src="http:<%= option.url %>" width="250px" height="250px"/><% }); %></div></div>');
        $("#primary-content").html(template(data));
    };

    /*
        This method is for rendering know the snap type question template
        using underscore js _template functionality
    */
    willowTree.renderQuestionForSnap = function(data){
        var template = _.template('<div class="well"><span><strong>Whose snap is this? </strong></span><img class="" src="http:<%=query%>" width="250px" height="250px"></div><div class="list-group"><% _.each(options, function (option) { %><button id="<%= option.id %>" data-type="<%= answer%>" type="button" class="list-group-item"><%= option.name%></button><% }); %></div>');
        $("#primary-content").html(template(data));
    };

    /* This method is for validating the answer */
    willowTree.validateAnswer = function(id, imgId){
        return map[id].headshot.id === imgId;
    };

    /* To reset counters between tab switch */
    willowTree.resetCounter = function(){
        counter = 0;
        clickCounter = 1;
        $('#score').hide();
        $('#attempts').hide();
    };

    /* know the name tab click */
    $('#name-mode').on('click',function(){
        willowTree.resetCounter();
        $('#image-mode').removeClass('active');
        $(this).addClass('active');
        if(teamData.length != 0){
            willowTree.renderQuestion(willowTree.getQuestionsPool(teamData)[0]);
        }
    });

    /* know the snap tab click */
    $('#image-mode').on('click',function(){
        willowTree.resetCounter();
        $('#name-mode').removeClass('active');
        $(this).addClass('active');
        if(teamData.length != 0){
            willowTree.renderQuestionForSnap(willowTree.getQuestionsPoolForSnaps(teamData)[0]);
        }
    });

    /* Image click from know the name options */
    $body.on('click','img',function(event){
        if($(this).attr('id')){
            var result = willowTree.validateAnswer($(this).attr('class'),$(this).attr('id'));
            if(result){
                counter++;
                $(this).css({'border':'3px solid green'});
                $("#primary-content").fadeOut();
                setTimeout(function(){
                    $("#primary-content").fadeIn();
                    willowTree.renderQuestion(willowTree.getQuestionsPool(teamData)[counter]);
                }, 500);
                $('#score').show().html('<strong>Well done!<strong> Your Total Score is '+counter+'.');
                $('#attempts').show().html('Total attempts for previous question: '+clickCounter);
                clickCounter = 1;
            } else {
                clickCounter++;
                $(this).css({'border':'3px solid red'}).fadeOut("slow");
            }
        }
    });

    /* Button click from know the snap options */
    $body.on('click','button',function(event){
        var result = willowTree.validateAnswer($(this).attr('data-type'),$(this).attr('id'));
        if(result){
            counter++;
            $(this).css({'background-color':'#8FBC8F'});
            $("#primary-content").fadeOut();
            setTimeout(function(){
                $("#primary-content").fadeIn();
                willowTree.renderQuestionForSnap(willowTree.getQuestionsPoolForSnaps(teamData)[counter]);
            }, 500);
            $('#score').show().html('<strong>Well done!<strong> Your Total Score is '+counter+'.');
            $('#attempts').show().html('Total attempts for previous question: '+clickCounter);
            clickCounter = 1;
        } else {
            clickCounter++;
            $(this).css({'background-color':'#E9967A'}).fadeOut("slow");
        }
    });

});
