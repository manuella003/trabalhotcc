// Estado da aplicação
let currentDate = new Date();
let currentView = 'month';
let aulas = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    carregarAulas();
});

// Event Listeners
function initEventListeners() {
    // View Toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            renderCalendar();
        });
    });
    
    // Navigation
    document.getElementById('prevPeriod').addEventListener('click', () => {
        navegarPeriodo(-1);
    });
    
    document.getElementById('nextPeriod').addEventListener('click', () => {
        navegarPeriodo(1);
    });
    
    // Modal
    document.getElementById('addAulaBtn').addEventListener('click', abrirModal);
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', fecharModal);
    });
    
    document.getElementById('modalAula').addEventListener('click', (e) => {
        if (e.target.id === 'modalAula') fecharModal();
    });
    
    // Form
    document.getElementById('formAula').addEventListener('submit', salvarAula);
    
    // Define data padrão no formulário
    document.getElementById('data').valueAsDate = new Date();
}

// Carregar aulas do servidor
async function carregarAulas() {
    try {
        const response = await fetch('api/aulas.php');
        aulas = await response.json();
        renderCalendar();
        atualizarEstatisticas();
    } catch (error) {
        console.error('Erro ao carregar aulas:', error);
    }
}

// Salvar nova aula
async function salvarAula(e) {
    e.preventDefault();
    
    const novaAula = {
        disciplina: document.getElementById('disciplina').value,
        turma: document.getElementById('turma').value,
        data: document.getElementById('data').value,
        horarioInicio: document.getElementById('horarioInicio').value,
        horarioFim: document.getElementById('horarioFim').value,
        sala: document.getElementById('sala').value,
        descricao: document.getElementById('descricao').value
    };
    
    try {
        const response = await fetch('api/aulas.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaAula)
        });
        
        const aulaCreated = await response.json();
        aulas.push(aulaCreated);
        
        fecharModal();
        document.getElementById('formAula').reset();
        renderCalendar();
        atualizarEstatisticas();
    } catch (error) {
        console.error('Erro ao salvar aula:', error);
        alert('Erro ao salvar aula!');
    }
}

// Deletar aula
async function deletarAula(id) {
    if (!confirm('Deseja realmente excluir esta aula?')) return;
    
    try {
        await fetch(`api/aulas.php?id=${id}`, { method: 'DELETE' });
        aulas = aulas.filter(a => a.id !== id);
        renderCalendar();
        atualizarEstatisticas();
    } catch (error) {
        console.error('Erro ao deletar aula:', error);
    }
}

// Navegação de período
function navegarPeriodo(direcao) {
    switch (currentView) {
        case 'month':
            currentDate.setMonth(currentDate.getMonth() + direcao);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + (7 * direcao));
            break;
        case 'day':
            currentDate.setDate(currentDate.getDate() + direcao);
            break;
    }
    renderCalendar();
}

// Render do calendário
function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    
    switch (currentView) {
        case 'month':
            container.innerHTML = renderMonthView();
            break;
        case 'week':
            container.innerHTML = renderWeekView();
            break;
        case 'day':
            container.innerHTML = renderDayView();
            break;
    }
    
    atualizarTituloPeriodo();
}

// Visualização de Mês
function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    let html = '<div class="month-view">';
    
    // Headers
    weekdays.forEach(day => {
        html += `<div class="weekday-header">${day}</div>`;
    });
    
    // Days
    const currentDay = new Date(startDate);
    for (let i = 0; i < 42; i++) {
        const isCurrentMonth = currentDay.getMonth() === month;
        const isToday = isHoje(currentDay);
        const dateStr = formatarData(currentDay);
        const aulasDay = aulas.filter(a => a.data === dateStr);
        
        html += `
            <div class="day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
                <div class="day-number">${currentDay.getDate()}</div>
                <div class="day-aulas">
                    ${aulasDay.slice(0, 3).map(a => `
                        <div class="aula-mini">${a.horarioInicio} - ${a.disciplina}</div>
                    `).join('')}
                    ${aulasDay.length > 3 ? `<div class="aula-mini">+${aulasDay.length - 3} mais</div>` : ''}
                </div>
            </div>
        `;
        
        currentDay.setDate(currentDay.getDate() + 1);
    }
    
    html += '</div>';
    return html;
}

// Visualização de Semana
function renderWeekView() {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const horarios = [];
    for (let h = 7; h <= 18; h++) {
        horarios.push(`${h.toString().padStart(2, '0')}:00`);
    }
    
    let html = '<div class="week-view">';
    
    // Header vazio
    html += '<div class="week-day-slot header"></div>';
    
    // Headers dos dias
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        const isToday = isHoje(day);
        
        html += `
            <div class="week-day-slot header ${isToday ? 'today' : ''}">
                <div>${weekdays[i]}</div>
                <div style="font-size: 20px; font-weight: 700;">${day.getDate()}</div>
            </div>
        `;
    }
    
    // Linhas de horários
    horarios.forEach(horario => {
        html += `<div class="time-slot">${horario}</div>`;
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            const dateStr = formatarData(day);
            
            const aulasHorario = aulas.filter(a => 
                a.data === dateStr && a.horarioInicio.startsWith(horario.split(':')[0])
            );
            
            html += `
                <div class="week-day-slot">
                    ${aulasHorario.map(a => `
                        <div class="aula-card" onclick="deletarAula('${a.id}')">
                            <strong>${a.disciplina}</strong><br>
                            ${a.turma} - ${a.sala}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    });
    
    html += '</div>';
    return html;
}

// Visualização de Dia
function renderDayView() {
    const dateStr = formatarData(currentDate);
    const aulasDia = aulas
        .filter(a => a.data === dateStr)
        .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
    
    if (aulasDia.length === 0) {
        return '<div style="text-align: center; padding: 40px; color: var(--text-gray);">Nenhuma aula agendada para este dia.</div>';
    }
    
    let html = '<div class="day-view">';
    
    aulasDia.forEach(aula => {
        html += `
            <div class="aula-card">
                <div class="aula-header">
                    <div>
                        <div class="aula-title">${aula.disciplina}</div>
                        <div class="aula-time">${aula.horarioInicio} - ${aula.horarioFim}</div>
                    </div>
                    <button class="btn-delete" onclick="deletarAula('${aula.id}')">Excluir</button>
                </div>
                <div class="aula-info">
                    <span>📚 ${aula.turma}</span>
                    <span>🚪 ${aula.sala}</span>
                </div>
                ${aula.descricao ? `<div class="aula-description">${aula.descricao}</div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Atualizar título do período
function atualizarTituloPeriodo() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let titulo = '';
    
    switch (currentView) {
        case 'month':
            titulo = `${meses[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            break;
        case 'week':
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            titulo = `${startOfWeek.getDate()} ${meses[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${meses[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
            break;
        case 'day':
            titulo = `${currentDate.getDate()} de ${meses[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            break;
    }
    
    document.getElementById('currentPeriod').textContent = titulo;
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const hoje = formatarData(new Date());
    const aulasHoje = aulas.filter(a => a.data === hoje).length;
    
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 6);
    const aulasSemana = aulas.filter(a => {
        const data = new Date(a.data);
        return data >= inicioSemana && data <= fimSemana;
    }).length;
    
    const inicioMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const fimMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const aulasMes = aulas.filter(a => {
        const data = new Date(a.data);
        return data >= inicioMes && data <= fimMes;
    }).length;
    
    document.getElementById('aulasHoje').textContent = aulasHoje;
    document.getElementById('aulasSemana').textContent = aulasSemana;
    document.getElementById('aulasMes').textContent = aulasMes;
}

// Modal
function abrirModal() {
    document.getElementById('modalAula').classList.add('active');
}

function fecharModal() {
    document.getElementById('modalAula').classList.remove('active');
}

// Utilitários
function formatarData(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isHoje(date) {
    const hoje = new Date();
    return date.getDate() === hoje.getDate() &&
           date.getMonth() === hoje.getMonth() &&
           date.getFullYear() === hoje.getFullYear();
}
