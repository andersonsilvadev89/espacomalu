import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  StyleSheet,
  ImageBackground,
  Linking,
  Modal, // Importação do Modal para a versão web
} from "react-native";
import { ref, push, set, onValue, remove, update, get } from "firebase/database";
import { auth, database } from "../../firebaseConfig";
import { Feather } from "@expo/vector-icons";
import { MaskedTextInput } from "react-native-mask-text";
import { Calendar } from "react-native-calendars"; // Importação do calendário

// Pode ser uma imagem local ou URL de fundo
const defaultFundoLocal = require("../../assets/images/fundo.png");

// Interface para os dados da reserva
interface Reserva {
  id?: string;
  DataDaReserva: string;
  DataRegistro: string;
  NomeDoCliente: string;
  TelefoneDoCliente: string;
  ValorDaReserva: string;
  FuncionarioResponsavel: string;
}

// Funções de formatação (mantidas do seu código original, mas podem ser adaptadas)
const formatarData = (text: string) => {
  const cleaned = text.replace(/\D/g, "");
  const dia = cleaned.substring(0, 2);
  const mes = cleaned.substring(2, 4);
  const ano = cleaned.substring(4, 8);

  let formattedDate = "";
  if (dia) {
    formattedDate += dia;
  }
  if (mes) {
    formattedDate += `/${mes}`;
  }
  if (ano) {
    formattedDate += `/${ano}`;
  }

  return formattedDate.substring(0, 10);
};

const formatarPreco = (valor: string) => {
  const cleaned = valor.replace(/\D/g, "");
  let num = parseInt(cleaned, 10);
  if (isNaN(num)) num = 0;
  const reais = (num / 100).toFixed(2);
  return `R$ ${reais.replace(".", ",")}`;
};

export default function CadastroReservas() {
  const [dataDaReserva, setDataDaReserva] = useState("");
  const [nomeDoCliente, setNomeDoCliente] = useState("");
  const [telefoneDoCliente, setTelefoneDoCliente] = useState("");
  const [valorDaReserva, setValorDaReserva] = useState("");
  const [funcionarioResponsavel, setFuncionarioResponsavel] = useState("");

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // Novo estado para controlar o calendário

  const scrollRef = useRef<ScrollView>(null);
  const userId = auth.currentUser?.uid;

  // Busca as reservas do banco de dados
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const reservasRef = ref(database, `reservas/${userId}`);
    const unsubscribeReservas = onValue(reservasRef, (snapshot) => {
      const data = snapshot.val();
      const lista: Reserva[] = data
        ? Object.entries(data).map(([id, valor]: any) => ({
            id,
            ...valor,
          }))
        : [];
      setReservas(lista.reverse());
      setLoading(false);
    });
    return () => unsubscribeReservas();
  }, [userId]);

  const salvarReserva = async () => {
    // Validação dos campos
    if (
      !dataDaReserva.trim() ||
      !nomeDoCliente.trim() ||
      !telefoneDoCliente.trim() ||
      !funcionarioResponsavel.trim()
    ) {
      alert("Erro: Todos os campos obrigatórios precisam ser preenchidos.");
      return;
    }

    // Lógica para verificar reservas na mesma data
    const reservaExistente = reservas.find(
      (reserva) =>
        reserva.DataDaReserva === dataDaReserva && reserva.id !== editandoId
    );

    if (reservaExistente) {
      alert("Erro: Já existe uma reserva para esta data.");
      return;
    }

    if (!userId) return;

    const novaReserva: Reserva = {
      DataDaReserva: dataDaReserva,
      DataRegistro: new Date().toLocaleDateString("pt-BR"),
      NomeDoCliente: nomeDoCliente,
      TelefoneDoCliente: telefoneDoCliente,
      ValorDaReserva: valorDaReserva,
      FuncionarioResponsavel: funcionarioResponsavel,
    };

    try {
      if (editandoId) {
        const reservaRef = ref(database, `reservas/${userId}/${editandoId}`);
        await update(reservaRef, novaReserva);
        alert("Sucesso: Reserva atualizada!");
      } else {
        const reservasRef = ref(database, `reservas/${userId}`);
        const novoRef = push(reservasRef);
        await set(novoRef, novaReserva);
        alert("Sucesso: Reserva salva com sucesso!");
      }
      limparFormulario();
    } catch (error) {
      alert("Erro: Não foi possível salvar a reserva. Tente novamente.");
    }
  };

  const limparFormulario = () => {
    setDataDaReserva("");
    setNomeDoCliente("");
    setTelefoneDoCliente("");
    setValorDaReserva("");
    setFuncionarioResponsavel("");
    setEditandoId(null);
    Keyboard.dismiss();
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const excluirReserva = (id: string) => {
    if (confirm("Confirmação: Deseja excluir esta reserva?")) {
      (async () => {
        if (!userId) return;
        const reservaRef = ref(database, `reservas/${userId}/${id}`);
        try {
          await remove(reservaRef);
          alert("Sucesso: Reserva excluída!");
        } catch (error) {
          alert("Erro: Não foi possível excluir a reserva. Tente novamente.");
        }
      })();
    }
  };

  const editarReserva = (reserva: Reserva) => {
    setDataDaReserva(reserva.DataDaReserva);
    setNomeDoCliente(reserva.NomeDoCliente);
    setTelefoneDoCliente(reserva.TelefoneDoCliente);
    setValorDaReserva(reserva.ValorDaReserva);
    setFuncionarioResponsavel(reserva.FuncionarioResponsavel);
    setEditandoId(reserva.id || null);
    setMostrarLista(false); // Esconde a lista para focar na edição
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleDayPress = (day: any) => {
    const formattedDate = `${String(day.day).padStart(2, "0")}/${String(
      day.month
    ).padStart(2, "0")}/${day.year}`;
    setDataDaReserva(formattedDate);
    setShowCalendar(false); // Fecha o modal
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    if (termoBusca.length < 3) return true;
    const termo = termoBusca.toLowerCase();
    return (
      reserva.NomeDoCliente.toLowerCase().includes(termo) ||
      reserva.DataDaReserva.toLowerCase().includes(termo) ||
      reserva.TelefoneDoCliente.toLowerCase().includes(termo) ||
      reserva.FuncionarioResponsavel.toLowerCase().includes(termo)
    );
  });

  if (loading) {
    return (
      <ImageBackground source={defaultFundoLocal} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Carregando reservas...</Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={defaultFundoLocal} style={styles.background}>
      <View style={styles.contentContainer}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollViewContent}
          style={styles.formScrollView}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Cadastro de Reservas</Text>

            <Text>Data da Reserva *</Text>
            {/* Campo de data com ícone de calendário */}
            <View style={styles.inputWithIcon}>
              <TextInput
                value={dataDaReserva}
                onChangeText={(text) => setDataDaReserva(formatarData(text))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                style={[styles.input, styles.dateInput]}
                maxLength={10}
              />
              <TouchableOpacity
                onPress={() => setShowCalendar(true)}
                style={styles.calendarIcon}
              >
                <Feather name="calendar" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <Text>Nome do Cliente *</Text>
            <TextInput
              value={nomeDoCliente}
              onChangeText={setNomeDoCliente}
              placeholder="Nome completo do cliente"
              style={styles.input}
            />

            <Text>Telefone do Cliente *</Text>
            <MaskedTextInput
              mask="(99) 99999-9999"
              value={telefoneDoCliente}
              onChangeText={(text) => setTelefoneDoCliente(text)}
              placeholder="Telefone (opcional)"
              keyboardType="phone-pad"
              style={styles.input}
              placeholderTextColor="#666"
            />

            <Text>Valor da Reserva</Text>
            <TextInput
              value={valorDaReserva}
              onChangeText={(text) => setValorDaReserva(formatarPreco(text))}
              placeholder="R$ 0,00"
              keyboardType="numeric"
              style={styles.input}
            />

            <Text>Funcionário Responsável *</Text>
            <TextInput
              value={funcionarioResponsavel}
              onChangeText={setFuncionarioResponsavel}
              placeholder="Nome do funcionário"
              style={styles.input}
            />
          </View>
        </ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={salvarReserva}
            >
              <Text style={styles.saveButtonText}>
                {editandoId ? "Atualizar Reserva" : "Salvar Reserva"}
              </Text>
            </TouchableOpacity>
            {editandoId && (
              <TouchableOpacity
                style={styles.clearFormButton}
                onPress={limparFormulario}
              >
                <Text style={styles.clearFormButtonText}>
                  Cancelar Edição / Limpar
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setMostrarLista(!mostrarLista)}
            >
              <Text style={styles.toggleButtonText}>
                {mostrarLista ? "Esconder Reservas" : "Ver Reservas Cadastradas"}
              </Text>
              <Feather
                name={mostrarLista ? "chevron-up" : "chevron-down"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {mostrarLista && (
          <KeyboardAvoidingView
            style={styles.productListOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.productListContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMostrarLista(false)}
              >
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
              <TextInput
                value={termoBusca}
                onChangeText={setTermoBusca}
                placeholder="Buscar reservas..."
                style={styles.input}
              />
              <Text style={styles.sectionTitle}>
                Reservas Cadastradas ({reservas.length})
              </Text>
              <ScrollView>
                {reservasFiltradas.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma reserva encontrada.</Text>
                ) : (
                  reservasFiltradas.map((item) => (
                    <View key={item.id} style={styles.listItemContainer}>
                      <View style={styles.productDetails}>
                        <Text style={styles.listItemTextBold}>
                          Reserva para: {item.NomeDoCliente}
                        </Text>
                        <Text style={styles.listItemText}>
                          Data: {item.DataDaReserva}
                        </Text>
                        <Text style={styles.listItemText}>
                          Telefone: {item.TelefoneDoCliente}
                        </Text>
                        <Text style={styles.listItemText}>
                          Valor: {item.ValorDaReserva}
                        </Text>
                        <Text style={styles.listItemText}>
                          Funcionário: {item.FuncionarioResponsavel}
                        </Text>
                      </View>
                      <View style={styles.buttonColumn}>
                        <Button
                          title="Editar"
                          onPress={() => editarReserva(item)}
                        />
                        <Button
                          title="Excluir"
                          onPress={() => excluirReserva(item.id!)}
                          color="red"
                        />
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>

      {/* Modal para o Calendário */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <TouchableOpacity
              onPress={() => setShowCalendar(false)}
              style={styles.modalCloseButton}
            >
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                [dataDaReserva.split("/").reverse().join("-")]: {
                  selected: true,
                  selectedColor: "#007BFF",
                },
              }}
              theme={{
                selectedDayBackgroundColor: '#007BFF',
                todayTextColor: '#007BFF',
                arrowColor: '#007BFF',
              }}
            />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    maxWidth: 450,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.17)000ff",
    borderRadius: 20,
    margin: 5,
  },
  formScrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 15,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 0,
    paddingRight: 50,
  },
  calendarIcon: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyText: {
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
  },
  listItemContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  productDetails: {
    flex: 1,
    marginBottom: 10,
  },
  listItemTextBold: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  listItemText: {
    marginBottom: 3,
  },
  buttonColumn: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
  },
  productListContainer: {
    backgroundColor: "rgba(224, 247, 250, 0.9)",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
  },
  productListOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    color: "#007BFF",
    fontSize: 16,
  },
  bottomButtonsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    gap: 10,
  },
  clearFormButton: {
    backgroundColor: "#e88585ff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  clearFormButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleButton: {
    backgroundColor: "#04ad20ff",
    borderRadius: 3,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  toggleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
});