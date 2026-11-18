(() => {
 const menuButton=document.querySelector('.menu-button');
 const menu=document.querySelector('.site-menu');
 function closeMenu(){if(!menu)return;menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');}
 menuButton?.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
 menu?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
 document.addEventListener('click',e=>{if(menu&&!menu.contains(e.target)&&!menuButton.contains(e.target))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu&&!menu.hidden){closeMenu();menuButton.focus();}});
 const dialog=document.querySelector('#inquiry');
 const form=document.querySelector('#inquiry-form');
 if(form) document.querySelectorAll('[data-inquiry]').forEach(button=>button.addEventListener('click',()=>{form.elements.service.value=button.dataset.inquiry||'';form.querySelector('.form-status').textContent='';dialog.showModal();}));
 document.querySelectorAll('[data-demo]').forEach(button=>button.addEventListener('click',()=>document.querySelector('#about-demo').showModal()));
 document.querySelectorAll('dialog').forEach(modal=>{modal.querySelector('.dialog-close').addEventListener('click',()=>modal.close());modal.addEventListener('click',event=>{const r=modal.getBoundingClientRect();if(event.target===modal&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))modal.close();});});
 if(form) document.querySelector('.email-start')?.addEventListener('submit',event=>{event.preventDefault();form.elements.email.value=event.target.elements.email.value;form.elements.service.value='';dialog.showModal();});
 form?.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const text=`Бриф проекта TEST\n\nИмя: ${data.get('name')}\nЭлектронная почта: ${data.get('email')}\nНаправление: ${data.get('service')}\n\nОбъект и задача:\n${data.get('details')}\n\nДемонстрационный бриф. Данные сохранены локально и не отправлены.\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Бриф-TEST.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);form.querySelector('.form-status').textContent='Бриф подготовлен. Сохраните файл для обсуждения проекта.';});
 const carousel=document.querySelector('.featured-products');
 if(carousel){const previous=document.querySelector('[data-carousel="prev"]'),next=document.querySelector('[data-carousel="next"]');const update=()=>{previous.disabled=carousel.scrollLeft<2;next.disabled=carousel.scrollLeft+carousel.clientWidth>=carousel.scrollWidth-3;};const step=()=>carousel.querySelector('article').getBoundingClientRect().width+parseFloat(getComputedStyle(carousel).gap);previous.addEventListener('click',()=>carousel.scrollBy({left:-step(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));next.addEventListener('click',()=>carousel.scrollBy({left:step(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));carousel.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();}
 document.querySelectorAll('details[name]').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)document.querySelectorAll(`details[name="${detail.name}"]`).forEach(other=>{if(other!==detail)other.open=false;});}));
})();
