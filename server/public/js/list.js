$(document).ready(function() {
   $('a.lightbox').lightBox();
   $('#not-responded * a.respond').click(function() {
      var $this = $(this),
          objId = /respond-(.+)/.exec($this.attr('id'))[1];

      $.post('/respond/' + objId, {}, function() {         
         var person = $('#person-' + objId),
             responded = $('#responded-num'),
             notResponded = $('#not-responded-num');

         responded.text((parseInt(responded.text())+1) + ' ');
         notResponded.text((parseInt(notResponded.text())-1) + ' ');

         person.parent().remove();
         $('#responded p.empty').hide();    

         var li = $('<li>');
         li.append(person);
         li.addClass('responded');
         $('#responded ul').prepend(li);

         $this.unbind('click');
      });
   })
});
