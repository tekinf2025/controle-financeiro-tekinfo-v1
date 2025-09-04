import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  List,
  Edit,
  Trash2,
  Copy,
  CheckSquare,
  MoreHorizontal,
  ArrowDownZA,
  ArrowUpAZ,
  Download,
  Upload,
  FileText
} from "lucide-react";
import { Expense } from "@/types/expense";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, importFromCSV, downloadCSVTemplate } from "@/lib/csv-utils";

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onImportExpenses?: (expenses: Expense[]) => void;
}

export function ExpenseList({ expenses, onEditExpense, onDeleteExpense, onToggleStatus, onImportExpenses }: ExpenseListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Inicia com Z-A (mais recente primeiro)
  
  // Initialize with current month dates
  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState<Date>(firstDay);
  const [endDate, setEndDate] = useState<Date>(lastDay);

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-based, no timezone issues
  };

  const filteredExpenses = useMemo(() => {
    const filtered = expenses.filter((expense) => {
      const matchesSearch = expense.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.observacao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || expense.categoria === filterCategory;
      const matchesStatus = filterStatus === "all" || expense.status === filterStatus;
      const matchesType = filterType === "all" || expense.tipo === filterType;
      
      // Date filtering with proper timezone handling
      if (expense.data_vencimento) {
        const expenseDate = parseDate(expense.data_vencimento);
        const matchesDateRange = expenseDate >= startDate && expenseDate <= endDate;
        return matchesSearch && matchesCategory && matchesStatus && matchesType && matchesDateRange;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = parseDate(a.data_vencimento);
      const dateB = parseDate(b.data_vencimento);
      
      if (sortOrder === "desc") {
        return dateB.getTime() - dateA.getTime(); // Z-A (mais recente primeiro)
      } else {
        return dateA.getTime() - dateB.getTime(); // A-Z (mais antigo primeiro)
      }
    });
  }, [expenses, searchTerm, filterCategory, filterStatus, filterType, startDate, endDate, sortOrder]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create a simple formatted string without Date object conversion
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  const getStatusIcon = (status: string) => {
    return status === 'Fechado' ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : (
      <Clock className="h-4 w-4 text-warning" />
    );
  };

  const getTypeIcon = (type: string) => {
    return type === 'Receita' ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  const categories = ['Custo Fixo', 'Custo Extra', 'Receita'];
  
  const handleCopyBarcode = async (barcode: string) => {
    try {
      await navigator.clipboard.writeText(barcode);
      toast({
        title: "Código copiado!",
        description: "Código de barras copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código de barras.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (expense: Expense) => {
    onEditExpense?.(expense);
  };

  const handleDelete = (id: string) => {
    onDeleteExpense?.(id);
  };

  const handleToggleStatus = (id: string) => {
    onToggleStatus?.(id);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredExpenses, `financeiro-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    toast({
      title: "Exportação realizada!",
      description: "Arquivo CSV baixado com sucesso.",
    });
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedExpenses = await importFromCSV(file);
      onImportExpenses?.(importedExpenses);
      toast({
        title: "Importação realizada!",
        description: `${importedExpenses.length} transações importadas com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro ao importar arquivo CSV",
        variant: "destructive",
      });
    } finally {
      // Limpar o input
      event.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    downloadCSVTemplate();
    toast({
      title: "Template baixado!",
      description: "Modelo CSV baixado com sucesso.",
    });
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-accent rounded-lg flex items-center justify-center">
              <List className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Transações</CardTitle>
              <CardDescription>
                Gerencie suas receitas e despesas
              </CardDescription>
            </div>
          </div>
          
          {/* Botões CSV */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs"
            >
              <FileText className="h-4 w-4 mr-1" />
              Template
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-import"
              />
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                <Upload className="h-4 w-4 mr-1" />
                Importar
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Data Inicial</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Data Final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Other Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="Aberto">Aberto</SelectItem>
              <SelectItem value="Fechado">Fechado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos tipos</SelectItem>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Saida">Saida</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
            <SelectTrigger>
              {sortOrder === "desc" ? (
                <ArrowDownZA className="h-4 w-4 mr-2" />
              ) : (
                <ArrowUpAZ className="h-4 w-4 mr-2" />
              )}
              <SelectValue placeholder="Ordenação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Z-A (Mais recente)</SelectItem>
              <SelectItem value="asc">A-Z (Mais antigo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expense List */}
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Nenhuma transação encontrada.
              </div>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <Card 
                key={expense.id} 
                className={cn(
                  "hover-lift transition-smooth border-l-4",
                  expense.tipo === 'Receita' 
                    ? "border-l-success bg-success/5" 
                    : "border-l-destructive bg-destructive/5"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(expense.tipo)}
                        <h4 className="font-medium">{expense.descricao}</h4>
                        <Badge variant="outline" className="text-xs">
                          {expense.categoria}
                        </Badge>
                      </div>
                      
                      {expense.observacao && (
                        <p className="text-sm text-muted-foreground">
                          {expense.observacao}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {expense.data_vencimento && (
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(expense.data_vencimento)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(expense.status)}
                          <span>{expense.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "text-lg font-bold",
                        expense.tipo === 'Receita' ? "text-success" : "text-destructive"
                      )}>
                        {expense.tipo === 'Receita' ? '+' : '-'}{formatCurrency(expense.valor)}
                      </div>
                      
                      {/* Actions Column */}
                      <div className="flex items-center space-x-1">
                        {expense.codigo_barras && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyBarcode(expense.codigo_barras!)}
                            className="h-8 w-8 p-0"
                            title="Copiar código de barras"
                          >
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                          className="h-8 w-8 p-0"
                          title="Editar lançamento"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        
                        {expense.status === 'Aberto' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(expense.id)}
                            className="h-8 w-8 p-0"
                            title="Fechar lançamento"
                          >
                            <CheckSquare className="h-4 w-4 text-success" />
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Excluir lançamento"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o lançamento "{expense.descricao}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(expense.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}