// Função para criar eventos com base nas entradas do formulário
function createCustomRecurringEvents(agentNames, startDateStr) {
  var calendarName = "Acolhimento";
  var calendar = getOrCreateCalendar(calendarName);

  if (!calendar) {
    Logger.log("Calendário não encontrado e não pôde ser criado: " + calendarName);
    return;
  }

  // Função para verificar se a data é um dia útil
  function isWeekday(date) {
    var day = date.getDay();
    return day !== 0 && day !== 6; // Exclui domingos (0) e sábados (6)
  }

  // Função para obter ou criar o calendário pelo nome
  function getOrCreateCalendar(name) {
    var calendars = CalendarApp.getAllCalendars();
    var calendar = calendars.find(function(cal) {
      return cal.getName() === name;
    });

    if (calendar) {
      return calendar;
    } else {
      // Se o calendário não existir, cria um novo
      return CalendarApp.createCalendar(name);
    }
  }

  // Função para converter uma data no formato DD/MM/AAAA para um objeto Date
  function parseDate(dateStr) {
    var parts = dateStr.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  // Função para obter o último dia útil do mês
  function getLastWeekdayOfMonth(year, month) {
    var lastDay = new Date(year, month + 1, 0); // Último dia do mês
    while (!isWeekday(lastDay)) {
      lastDay.setDate(lastDay.getDate() - 1); // Retrocede um dia se não for dia útil
    }
    return lastDay;
  }

  // Função para obter o próximo dia útil
  function getNextWeekday(date) {
    var nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    while (!isWeekday(nextDate)) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate;
  }

  // Inicializar variáveis
  var agentNamesArray = agentNames.split(',').map(name => name.trim());

  // Limitar o número de agentes a no máximo 15
  var maxAgents = 15;
  if (agentNamesArray.length > maxAgents) {
    agentNamesArray = agentNamesArray.slice(0, maxAgents);
    Logger.log("Número de agentes excedido. Apenas os primeiros " + maxAgents + " agentes serão usados.");
  }

  var startDate = parseDate(startDateStr);
  var lastDayOfMonth = getLastWeekdayOfMonth(startDate.getFullYear(), startDate.getMonth());
  var currentDate = (startDate > lastDayOfMonth) ? lastDayOfMonth : startDate; // Começa na data inicial se ela for antes ou igual ao último dia útil do mês
  var agentIndex = 0;
  var eventCount = 0;
  var maxEvents = 30;

  // Criação dos eventos
  while (currentDate <= lastDayOfMonth && eventCount < maxEvents) {
    if (isWeekday(currentDate)) {
      var agentName = agentNamesArray[agentIndex];
      var eventStartTime = new Date(currentDate);
      eventStartTime.setHours(7, 0, 0, 0); // Define a hora para 07h00
      var endDate = new Date(eventStartTime.getTime() + (60 * 60 * 1000)); // Duração de 1 hora
      calendar.createEvent(agentName, eventStartTime, endDate, {description: "Descrição do evento"});

      // Avançar para o próximo agente
      agentIndex = (agentIndex + 1) % agentNamesArray.length;

      // Incrementar a contagem de eventos
      eventCount++;
    }

    // Avançar para o próximo dia útil
    currentDate = getNextWeekday(currentDate);
  }

  if (eventCount >= maxEvents) {
    Logger.log("Limite de eventos alcançado: " + maxEvents);
  }
}

// Função para exibir o formulário HTML
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Form.html')
      .setWidth(400)
      .setHeight(300);
}