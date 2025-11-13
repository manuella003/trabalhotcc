function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
  
    // 🔹 Carregar eventos salvos
    const savedEvents = JSON.parse(localStorage.getItem('eventos')) || [];
  
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'pt-br',
      height: '100%',
      expandRows: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      events: savedEvents,
  
      // 🌟 Clique no dia → adicionar evento
      dateClick: function(info) {
        const title = prompt('Digite o título da aula:');
        if (title) {
          const newEvent = { title, start: info.dateStr };
          calendar.addEvent(newEvent);
          savedEvents.push(newEvent);
          localStorage.setItem('eventos', JSON.stringify(savedEvents));
        }
      },
  
      // ✨ Animação leve ao renderizar eventos
      eventDidMount: function(info) {
        info.el.style.opacity = 0;
        info.el.style.transform = 'scale(0.95)';
        setTimeout(() => {
          info.el.style.transition = 'all 0.3s ease';
          info.el.style.opacity = 1;
          info.el.style.transform = 'scale(1)';
        }, 10);
      },
  
      // 🌀 Transição ao trocar de mês
      viewDidMount: function(view) {
        calendarEl.classList.add('fade-in');
        setTimeout(() => calendarEl.classList.remove('fade-in'), 400);
      }
    });
  
    calendar.render();
  }
  