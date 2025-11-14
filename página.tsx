'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LogOut, BookOpen, Clock, Plus, Trash2, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

type Aula = {
  id: string
  disciplina: string
  turma: string
  horario: string
  sala: string
  descricao: string
  data: Date
}

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarioAcademico() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [aulas, setAulas] = useState<Aula[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [novaAula, setNovaAula] = useState({
    disciplina: '',
    turma: '',
    horario: '08:00',
    sala: '',
    descricao: ''
  })

  const professorNome = 'Prof. João Silva'

  const handleAddAula = () => {
    if (!novaAula.disciplina || !novaAula.turma) return

    const aula: Aula = {
      id: Date.now().toString(),
      disciplina: novaAula.disciplina,
      turma: novaAula.turma,
      horario: novaAula.horario,
      sala: novaAula.sala,
      descricao: novaAula.descricao,
      data: selectedDate
    }

    setAulas([...aulas, aula])
    setNovaAula({ disciplina: '', turma: '', horario: '08:00', sala: '', descricao: '' })
    setIsDialogOpen(false)
  }

  const handleDeleteAula = (id: string) => {
    setAulas(aulas.filter(aula => aula.id !== id))
  }

  const aulasDoMes = aulas.filter(aula => 
    aula.data.getMonth() === selectedDate.getMonth() &&
    aula.data.getFullYear() === selectedDate.getFullYear()
  )

  const aulasDaSemana = aulas.filter(aula => {
    const weekStart = startOfWeek(selectedDate, { locale: ptBR })
    const weekEnd = endOfWeek(selectedDate, { locale: ptBR })
    return aula.data >= weekStart && aula.data <= weekEnd
  })

  const aulasDoDia = aulas.filter(aula => 
    isSameDay(aula.data, selectedDate)
  )

  const handleSair = () => {
    alert('Saindo do sistema...')
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1
    setSelectedDate(addDays(selectedDate, direction === 'next' ? days : -days))
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { locale: ptBR })

    return (
      <div className="bg-slate-900/50 rounded-xl p-6 border border-blue-800/30">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
            <div key={dia} className="text-center text-sm font-semibold text-blue-300 py-2">
              {dia}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {weeks.map((weekStart, weekIndex) => {
            const days = eachDayOfInterval({
              start: weekStart,
              end: endOfWeek(weekStart, { locale: ptBR })
            })
            
            return (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const aulasNoDia = aulas.filter(aula => isSameDay(aula.data, day))
                  const isSelected = isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-24 p-2 rounded-lg transition-all border-2
                        ${isSelected ? 'border-blue-400 bg-blue-500/20' : 'border-transparent'}
                        ${isToday && !isSelected ? 'border-blue-600' : ''}
                        ${isCurrentMonth ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-900/30 opacity-40'}
                      `}
                    >
                      <div className="text-left">
                        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-400' : 'text-blue-100'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {aulasNoDia.slice(0, 2).map((aula) => (
                            <div key={aula.id} className="text-xs bg-blue-600/60 rounded px-1 py-0.5 truncate">
                              {aula.horario} {aula.disciplina}
                            </div>
                          ))}
                          {aulasNoDia.length > 2 && (
                            <div className="text-xs text-blue-400">
                              +{aulasNoDia.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { locale: ptBR })
    const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(selectedDate, { locale: ptBR }) })
    const horarios = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

    return (
      <div className="bg-slate-900/50 rounded-xl p-6 border border-blue-800/30 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-center text-sm font-semibold text-blue-300 py-2">Horário</div>
            {days.map((day) => (
              <div key={day.toISOString()} className="text-center">
                <div className="text-sm font-semibold text-blue-300">{format(day, 'EEE', { locale: ptBR })}</div>
                <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-blue-400 font-bold' : 'text-blue-100'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
          {horarios.map((horario) => (
            <div key={horario} className="grid grid-cols-8 gap-2 mb-1">
              <div className="text-sm text-blue-300 py-2 text-center">{horario}</div>
              {days.map((day) => {
                const aulaNoHorario = aulas.find(aula => 
                  isSameDay(aula.data, day) && aula.horario === horario
                )
                
                return (
                  <div
                    key={`${day.toISOString()}-${horario}`}
                    className="min-h-12 bg-slate-800/30 rounded p-1 border border-slate-700/30"
                  >
                    {aulaNoHorario && (
                      <div className="bg-blue-600/80 rounded px-2 py-1 text-xs h-full">
                        <div className="font-semibold">{aulaNoHorario.disciplina}</div>
                        <div className="text-blue-100">{aulaNoHorario.turma}</div>
                        <div className="text-blue-200">{aulaNoHorario.sala}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const horarios = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

    return (
      <div className="bg-slate-900/50 rounded-xl p-6 border border-blue-800/30">
        <div className="space-y-2">
          {horarios.map((horario) => {
            const aulaNoHorario = aulasDoDia.find(aula => aula.horario === horario)
            
            return (
              <div key={horario} className="flex gap-4 items-start">
                <div className="w-20 text-blue-300 font-semibold pt-2">{horario}</div>
                <div className="flex-1 min-h-16 bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                  {aulaNoHorario ? (
                    <div className="bg-blue-600/80 rounded-lg p-3 h-full">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-lg">{aulaNoHorario.disciplina}</div>
                          <div className="text-blue-100 mt-1">Turma: {aulaNoHorario.turma}</div>
                          <div className="text-blue-200">Sala: {aulaNoHorario.sala}</div>
                          {aulaNoHorario.descricao && (
                            <div className="text-sm text-blue-100 mt-2">{aulaNoHorario.descricao}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAula(aulaNoHorario.id)}
                          className="text-red-300 hover:text-red-100 hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-blue-900/40 border-b border-blue-800/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Sistema Acadêmico</h1>
              <p className="text-sm text-blue-300">Calendário de Aulas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-800/30 rounded-lg border border-blue-700/30">
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">JS</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">{professorNome}</div>
                <div className="text-xs text-blue-300">Professor</div>
              </div>
            </div>
            <Button 
              onClick={handleSair}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Controles */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigateDate('prev')}
              variant="outline"
              size="icon"
              className="bg-blue-900/40 border-blue-800/30 text-blue-100 hover:bg-blue-800/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-6 py-2 bg-blue-900/40 rounded-lg border border-blue-800/30">
              <div className="text-xl font-bold text-white">
                {viewMode === 'month' && format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                {viewMode === 'week' && `Semana de ${format(startOfWeek(selectedDate, { locale: ptBR }), 'd MMM', { locale: ptBR })}`}
                {viewMode === 'day' && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            </div>
            <Button
              onClick={() => navigateDate('next')}
              variant="outline"
              size="icon"
              className="bg-blue-900/40 border-blue-800/30 text-blue-100 hover:bg-blue-800/50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setSelectedDate(new Date())}
              variant="outline"
              className="bg-blue-900/40 border-blue-800/30 text-blue-100 hover:bg-blue-800/50"
            >
              Hoje
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-blue-800/30">
              <Button
                onClick={() => setViewMode('month')}
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                className={viewMode === 'month' ? 'bg-blue-600' : 'bg-blue-900/40 text-blue-100'}
              >
                Mês
              </Button>
              <Button
                onClick={() => setViewMode('week')}
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                className={viewMode === 'week' ? 'bg-blue-600' : 'bg-blue-900/40 text-blue-100'}
              >
                Semana
              </Button>
              <Button
                onClick={() => setViewMode('day')}
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                className={viewMode === 'day' ? 'bg-blue-600' : 'bg-blue-900/40 text-blue-100'}
              >
                Dia
              </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Aula
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-blue-800/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Adicionar Nova Aula</DialogTitle>
                  <DialogDescription className="text-blue-300">
                    Cadastre uma nova aula para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="disciplina" className="text-blue-100">Disciplina</Label>
                    <Input
                      id="disciplina"
                      placeholder="Ex: Matemática"
                      value={novaAula.disciplina}
                      onChange={(e) => setNovaAula({ ...novaAula, disciplina: e.target.value })}
                      className="bg-slate-800 border-blue-800/30 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="turma" className="text-blue-100">Turma</Label>
                      <Input
                        id="turma"
                        placeholder="Ex: 3º A"
                        value={novaAula.turma}
                        onChange={(e) => setNovaAula({ ...novaAula, turma: e.target.value })}
                        className="bg-slate-800 border-blue-800/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horario" className="text-blue-100">Horário</Label>
                      <Input
                        id="horario"
                        type="time"
                        value={novaAula.horario}
                        onChange={(e) => setNovaAula({ ...novaAula, horario: e.target.value })}
                        className="bg-slate-800 border-blue-800/30 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sala" className="text-blue-100">Sala</Label>
                    <Input
                      id="sala"
                      placeholder="Ex: Sala 101"
                      value={novaAula.sala}
                      onChange={(e) => setNovaAula({ ...novaAula, sala: e.target.value })}
                      className="bg-slate-800 border-blue-800/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao" className="text-blue-100">Descrição</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Conteúdo da aula, observações..."
                      value={novaAula.descricao}
                      onChange={(e) => setNovaAula({ ...novaAula, descricao: e.target.value })}
                      rows={3}
                      className="bg-slate-800 border-blue-800/30 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-blue-800/30 text-blue-100">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddAula} disabled={!novaAula.disciplina || !novaAula.turma} className="bg-blue-600 hover:bg-blue-700">
                    Salvar Aula
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Calendário */}
        <div className="mb-6">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>

        {/* Resumo de Aulas */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-blue-900/40 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-blue-100 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Aulas do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{aulasDoDia.length}</div>
              <p className="text-sm text-blue-300 mt-1">
                {aulasDoDia.length === 1 ? 'aula agendada' : 'aulas agendadas'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/40 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-blue-100 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Aulas da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{aulasDaSemana.length}</div>
              <p className="text-sm text-blue-300 mt-1">
                {aulasDaSemana.length === 1 ? 'aula agendada' : 'aulas agendadas'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/40 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-blue-100 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Aulas do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{aulasDoMes.length}</div>
              <p className="text-sm text-blue-300 mt-1">
                {aulasDoMes.length === 1 ? 'aula agendada' : 'aulas agendadas'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
