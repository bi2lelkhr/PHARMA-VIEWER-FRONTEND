import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import {
  ChevronLeft,
  FileText,
  Activity,
  Calendar,
  Eye,
  CheckCircle,
  ChevronRight,
  Lock,
  Building,
  Info,
  Send,
  LogOut,
  Menu,
  X,
  Home,
  History,
  AlertCircle,
  MessageSquare,
  Search,
  Users,
  BarChart3,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Download,
  Bell,
  Shield,
  Eye as EyeIcon,
  Globe,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  Brain,
  FlaskConical,
  Building2,
  Briefcase,
  ChevronRight as ChevronRightIcon,
  ChevronDown,
} from "lucide-react";

import { labsData, LabData } from "./data/labsData";

const API_URL = "https://elkendiviewer-backend.onrender.com/";
const TOKEN_KEY = "jwt_token";
const EXP_KEY = "token_expiration";
const USER_PROFILE_KEY = "user_profile";

// View options for role R
const VIEW_OPTIONS = [
  { value: "CVS", label: "CVS" },
  { value: "CNS", label: "CNS" },
  { value: "PUR", label: "PUR" },
  { value: "HOSP", label: "HOSP" },
  { value: "COMMERCIAL", label: "COMMERCIAL" },
  { value: "ALL", label: "ALL" },
];

interface LoginData {
  email: string;
  password: string;
}

interface UserProfile {
  email: string;
  name: string;
  initial: string;
  role: "A" | "D" | "R"; // A=Admin, D=Delegate, R=Read-only
  user_id: string;
  view?: string; // Added view field for role R
}

interface InformationData {
  type_bu: string;
  type_info: string;
  laboratoire: string;
  produit: string;
  comment: string;
}

interface SubmittedInformation {
  id: number;
  type_bu: string;
  type_info: string;
  laboratoire: string;
  produit_concurent: string;
  comment: string;
  created_at: string;
  info_date: string;
  users?: {
    email: string;
  };
}

interface User {
  id: string;
  email: string;
  role: "A" | "D" | "R";
  created_at: string;
  user_code: string;
  view?: string; // Added view field
}

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots: (string | number)[] = [];
    let l: number;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{startItem}</span> à{" "}
            <span className="font-medium">{endItem}</span> sur{" "}
            <span className="font-medium">{totalItems}</span> résultats
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Première page</span>
              <ChevronsLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Précédent</span>
              <ChevronLeft className="h-5 w-5" />
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={index}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                >
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => onPageChange(page as number)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                    currentPage === page
                      ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Suivant</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Dernière page</span>
              <ChevronsRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile version */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <div className="text-sm text-gray-700">
          Page {currentPage} sur {totalPages}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default function App() {
  // Login state
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Information form state
  const [infoData, setInfoData] = useState<InformationData>({
    type_bu: "",
    type_info: "",
    laboratoire: "",
    produit: "",
    comment: "",
  });

  // Admin states
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [allInformations, setAllInformations] = useState<
    SubmittedInformation[]
  >([]);
  const [newUser, setNewUser] = useState({
    email: "",
    user_code: "",
    role: "D" as "A" | "D" | "R",
    view: "",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    date: "",
    from: "",
    to: "",
    type_bu: "",
    type_info: "",
    user_id: "",
  });

  // Role R - Authorized View states
  const [authorizedInformations, setAuthorizedInformations] = useState<
    SubmittedInformation[]
  >([]);
  const [filteredAuthorized, setFilteredAuthorized] = useState<
    SubmittedInformation[]
  >([]);
  const [authorizedLoading, setAuthorizedLoading] = useState<boolean>(false);
  const [authorizedSearch, setAuthorizedSearch] = useState<string>("");
  const [authorizedFilters, setAuthorizedFilters] = useState({
    type_info: "",
    type_bu: "", // Added type_bu filter for users with ALL view
    date: "",
    from: "",
    to: "",
  });

  // User's submitted informations state
  const [userInformations, setUserInformations] = useState<
    SubmittedInformation[]
  >([]);
  const [filteredInformations, setFilteredInformations] = useState<
    SubmittedInformation[]
  >([]);
  const [informationsLoading, setInformationsLoading] =
    useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedComment, setSelectedComment] = useState<string>("");
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);

  // Labs data state
  const [filteredLabs, setFilteredLabs] = useState<LabData[]>(labsData);
  const [filteredProducts, setFilteredProducts] = useState<string[]>([]);
  const [showLabDropdown, setShowLabDropdown] = useState<boolean>(false);
  const [showProductDropdown, setShowProductDropdown] =
    useState<boolean>(false);

  // UI state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [apiMessage, setApiMessage] = useState<string>("");
  const [apiMessageType, setApiMessageType] = useState<"success" | "error">(
    "success",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileUserDropdownOpen, setMobileUserDropdownOpen] =
    useState<boolean>(false);
  const [currentView, setCurrentView] = useState<
    | "accueil"
    | "mes-informations"
    | "gestion-utilisateurs"
    | "toutes-informations"
    | "vue-autorisee"
  >("accueil");

  // Pagination states
  const [authorizedCurrentPage, setAuthorizedCurrentPage] = useState<number>(1);
  const [informationsCurrentPage, setInformationsCurrentPage] =
    useState<number>(1);
  const [usersCurrentPage, setUsersCurrentPage] = useState<number>(1);
  const [allInfoCurrentPage, setAllInfoCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // User management search state
  const [userSearchTerm, setUserSearchTerm] = useState<string>("");

  // Refs for dropdown handling
  const labInputRef = useRef<HTMLInputElement>(null);
  const labDropdownRef = useRef<HTMLDivElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        labDropdownRef.current &&
        !labDropdownRef.current.contains(event.target as Node) &&
        labInputRef.current &&
        !labInputRef.current.contains(event.target as Node)
      ) {
        setShowLabDropdown(false);
      }
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node) &&
        productInputRef.current &&
        !productInputRef.current.contains(event.target as Node)
      ) {
        setShowProductDropdown(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setMobileUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load data based on current view
  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;

    if (currentView === "mes-informations") {
      fetchUserInformations();
    } else if (
      currentView === "toutes-informations" &&
      userProfile.role === "A"
    ) {
      fetchAllInformations();
    } else if (
      currentView === "gestion-utilisateurs" &&
      userProfile.role === "A"
    ) {
      fetchAllUsers();
    } else if (currentView === "vue-autorisee" && userProfile.role === "R") {
      fetchAuthorizedView();
    }
  }, [currentView, isAuthenticated, userProfile]);

  // Reset pagination when data changes
  useEffect(() => {
    setAuthorizedCurrentPage(1);
  }, [filteredAuthorized]);

  useEffect(() => {
    setInformationsCurrentPage(1);
  }, [filteredInformations]);

  useEffect(() => {
    setUsersCurrentPage(1);
  }, [filteredUsers]);

  useEffect(() => {
    setAllInfoCurrentPage(1);
  }, [allInformations]);

  // Filter users when search term changes
  useEffect(() => {
    if (userSearchTerm.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const searchTerm = userSearchTerm.toLowerCase();
      const filtered = allUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm) ||
          user.user_code.toLowerCase().includes(searchTerm) ||
          user.role.toLowerCase().includes(searchTerm) ||
          (user.view && user.view.toLowerCase().includes(searchTerm)),
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, allUsers]);

  // Filter labs based on search term
  useEffect(() => {
    if (infoData.laboratoire.trim() === "") {
      setFilteredLabs(labsData);
    } else {
      const searchTerm = infoData.laboratoire.toLowerCase();
      const filtered = labsData.filter(
        (lab) =>
          lab.lab.toLowerCase().includes(searchTerm) ||
          lab.products.some((product) =>
            product.toLowerCase().includes(searchTerm),
          ),
      );
      setFilteredLabs(filtered);
    }
  }, [infoData.laboratoire]);

  // Filter products based on search term
  useEffect(() => {
    if (infoData.type_info === "Vos recommandations") return;

    if (!infoData.laboratoire || infoData.produit.trim() === "") {
      const lab = labsData.find((l) => l.lab === infoData.laboratoire);
      setFilteredProducts(lab?.products || []);
    } else {
      const searchTerm = infoData.produit.toLowerCase();
      const lab = labsData.find((l) => l.lab === infoData.laboratoire);
      if (lab) {
        const filtered = lab.products
          .filter((product) => product.toLowerCase().includes(searchTerm))
          .sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            if (aLower === searchTerm) return -1;
            if (bLower === searchTerm) return 1;
            if (aLower.startsWith(searchTerm)) return -1;
            if (bLower.startsWith(searchTerm)) return 1;
            return 0;
          });
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts([]);
      }
    }
  }, [infoData.produit, infoData.laboratoire, infoData.type_info]);

  // Filter authorized informations when search term changes
  useEffect(() => {
    let filtered = authorizedInformations;

    // Apply BU filter if user has ALL view and filter is set
    if (userProfile?.view?.includes("ALL") && authorizedFilters.type_bu) {
      filtered = filtered.filter(
        (info) => info.type_bu === authorizedFilters.type_bu,
      );
    }

    // Apply search filter
    if (authorizedSearch.trim() === "") {
      setFilteredAuthorized(filtered);
    } else {
      const searched = filtered.filter(
        (info) =>
          info.laboratoire
            .toLowerCase()
            .includes(authorizedSearch.toLowerCase()) ||
          info.produit_concurent
            ?.toLowerCase()
            .includes(authorizedSearch.toLowerCase()) ||
          info.type_bu.toLowerCase().includes(authorizedSearch.toLowerCase()) ||
          info.type_info
            .toLowerCase()
            .includes(authorizedSearch.toLowerCase()) ||
          info.comment
            ?.toLowerCase()
            .includes(authorizedSearch.toLowerCase()) ||
          info.users?.email
            .toLowerCase()
            .includes(authorizedSearch.toLowerCase()),
      );
      setFilteredAuthorized(searched);
    }
  }, [
    authorizedSearch,
    authorizedInformations,
    authorizedFilters.type_bu,
    userProfile,
  ]);

  // Filter user informations when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInformations(userInformations);
    } else {
      const filtered = userInformations.filter(
        (info) =>
          info.laboratoire.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.produit_concurent
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          info.type_bu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.type_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.comment?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredInformations(filtered);
    }
  }, [searchTerm, userInformations]);

  // Get current page items for authorized view
  const getCurrentAuthorizedItems = () => {
    const indexOfLastItem = authorizedCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredAuthorized.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Get current page items for user informations
  const getCurrentInformationsItems = () => {
    const indexOfLastItem = informationsCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredInformations.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Get current page items for users
  const getCurrentUsersItems = () => {
    const indexOfLastItem = usersCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Get current page items for all informations
  const getCurrentAllInfoItems = () => {
    const indexOfLastItem = allInfoCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allInformations.slice(indexOfFirstItem, indexOfLastItem);
  };

  const checkSession = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const exp = localStorage.getItem(EXP_KEY);
    const storedProfile = localStorage.getItem(USER_PROFILE_KEY);

    if (token && exp && new Date().getTime() < parseInt(exp)) {
      try {
        // Fetch fresh profile to verify role
        const profile = await fetchProfile(token);
        if (profile) {
          setIsAuthenticated(true);
          setCurrentStep(2);
          setUserProfile(profile);
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));

          // Set default view based on role
          if (profile.role === "R") {
            setCurrentView("vue-autorisee");
          } else {
            setCurrentView("accueil");
          }
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    } else {
      logout();
    }
  };

  const fetchProfile = async (token: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${API_URL}/informations/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const email = data.email;
        const name = email.split("@")[0];
        const initial = name.charAt(0).toUpperCase();

        return {
          email: email,
          name: name,
          initial: initial,
          role: data.role,
          user_id: data.user_id,
          view: data.view, // Added view field
        };
      }
      return null;
    } catch (error) {
      console.error("Fetch profile error:", error);
      return null;
    }
  };

  // Fetch authorized view for role R
  const fetchAuthorizedView = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setApiMessageType("error");
      setApiMessage("Session expirée. Veuillez vous reconnecter.");
      setTimeout(() => logout(), 2000);
      return;
    }

    setAuthorizedLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (authorizedFilters.type_info)
        queryParams.append("type_info", authorizedFilters.type_info);
      if (authorizedFilters.date)
        queryParams.append("date", authorizedFilters.date);
      if (authorizedFilters.from)
        queryParams.append("from", authorizedFilters.from);
      if (authorizedFilters.to) queryParams.append("to", authorizedFilters.to);

      const res = await fetch(
        `${API_URL}/informations/my-view?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        setAuthorizedInformations(data.data || []);
        setFilteredAuthorized(data.data || []);
      } else {
        setApiMessageType("error");
        setApiMessage(
          data.error || "Erreur lors de la récupération des informations.",
        );
      }
    } catch (error) {
      console.error("Fetch authorized view error:", error);
      setApiMessageType("error");
      setApiMessage("Erreur de connexion au serveur");
    } finally {
      setAuthorizedLoading(false);
    }
  };

  const fetchUserInformations = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setApiMessageType("error");
      setApiMessage("Session expirée. Veuillez vous reconnecter.");
      setTimeout(() => logout(), 2000);
      return;
    }

    setInformationsLoading(true);
    try {
      const res = await fetch(`${API_URL}/informations/my-informations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUserInformations(data.data || []);
        setFilteredInformations(data.data || []);
      } else {
        setApiMessageType("error");
        setApiMessage("Erreur lors de la récupération des informations.");
      }
    } catch (error) {
      console.error("Fetch informations error:", error);
      setApiMessageType("error");
      setApiMessage("Erreur de connexion au serveur");
    } finally {
      setInformationsLoading(false);
    }
  };

  // ADMIN FUNCTIONS
  const fetchAllUsers = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/informations/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  const fetchAllInformations = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    try {
      const res = await fetch(
        `${API_URL}/informations/all-informations?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setAllInformations(data.data || []);
      }
    } catch (error) {
      console.error("Fetch all informations error:", error);
    }
  };

  const createUser = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    if (!newUser.email || !newUser.user_code) {
      setApiMessageType("error");
      setApiMessage("Email et code utilisateur sont requis");
      return;
    }

    setIsLoading(true);
    try {
      // Create user data object
      const userData: any = {
        email: newUser.email,
        user_code: newUser.user_code,
        role: newUser.role,
      };

      // Only add view field for role R
      if (newUser.role === "R") {
        userData.view = newUser.view;
      }

      const res = await fetch(`${API_URL}/informations/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        setApiMessageType("success");
        setApiMessage("Utilisateur créé avec succès");
        setNewUser({ email: "", user_code: "", role: "D", view: "" });
        fetchAllUsers();
      } else {
        setApiMessageType("error");
        setApiMessage(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Create user error:", error);
      setApiMessageType("error");
      setApiMessage("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (user: User) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !editingUser) return;

    setIsLoading(true);
    try {
      // Create update data object
      const updateData: any = {
        role: editingUser.role,
      };

      // Only add view field for role R
      if (editingUser.role === "R") {
        updateData.view = editingUser.view;
      }

      const res = await fetch(`${API_URL}/informations/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setApiMessageType("success");
        setApiMessage("Utilisateur mis à jour");
        setEditingUser(null);
        fetchAllUsers();
      }
    } catch (error) {
      console.error("Update user error:", error);
      setApiMessageType("error");
      setApiMessage("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/informations/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        setApiMessageType("success");
        setApiMessage("Utilisateur supprimé");
        fetchAllUsers();
      }
    } catch (error) {
      console.error("Delete user error:", error);
      setApiMessageType("error");
      setApiMessage("Erreur lors de la suppression");
    }
  };

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (apiMessageType === "error") {
      setApiMessage("");
    }
  };

  const handleInfoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setInfoData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Show dropdown when typing in laboratoire field
    if (id === "laboratoire") {
      setShowLabDropdown(true);
      setShowProductDropdown(false);
    }
    // Show dropdown when typing in produit field and laboratoire is selected
    if (
      id === "produit" &&
      infoData.laboratoire &&
      infoData.type_info !== "Vos recommandations"
    ) {
      setShowProductDropdown(true);
    }

    if (apiMessageType === "error") {
      setApiMessage("");
    }
  };

  const selectLab = (labName: string) => {
    setInfoData((prev) => ({
      ...prev,
      laboratoire: labName,
      produit: "", // Clear product when lab changes
    }));
    setShowLabDropdown(false);

    // Reset product dropdown
    const lab = labsData.find((l) => l.lab === labName);
    if (lab) {
      setFilteredProducts(lab.products);
    }
  };

  const selectProduct = (productName: string) => {
    setInfoData((prev) => ({
      ...prev,
      produit: productName,
    }));
    setShowProductDropdown(false);
  };

  const getProductsForSelectedLab = () => {
    if (!infoData.laboratoire || infoData.type_info === "Vos recommandations")
      return [];
    const selectedLab = labsData.find(
      (lab) => lab.lab === infoData.laboratoire,
    );
    return selectedLab ? selectedLab.products : [];
  };

  // Export CSV for authorized view
  const exportAuthorizedToCSV = () => {
    if (filteredAuthorized.length === 0) {
      setApiMessageType("error");
      setApiMessage("Aucune donnée à exporter");
      return;
    }

    const csvData = filteredAuthorized.map((info) => ({
      Date: formatDate(info.created_at),
      Utilisateur: info.users?.email || "Inconnu",
      BU: info.type_bu,
      Type: info.type_info,
      Laboratoire: info.laboratoire,
      "Produit concurrent": info.produit_concurent || "",
      Commentaire: info.comment || "",
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informations_autorisees_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setApiMessageType("success");
  };

  // ---------- LOGIN ----------
  const login = async () => {
    if (!loginData.email || !loginData.password) {
      setApiMessageType("error");
      setApiMessage("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setApiMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(
          EXP_KEY,
          (new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toString(),
        );

        // Fetch user profile
        const profile = await fetchProfile(data.token);
        if (profile) {
          setUserProfile(profile);
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
          setIsAuthenticated(true);
          setCurrentStep(2);

          // Set default view based on role
          if (profile.role === "R") {
            setCurrentView("vue-autorisee");
          } else {
            setCurrentView("accueil");
          }

          setApiMessageType("success");
        } else {
          setApiMessageType("error");
          setApiMessage("Erreur lors de la récupération du profil");
        }
      } else {
        setApiMessageType("error");
        setApiMessage(data.message || "Échec de la connexion");
      }
    } catch (error) {
      console.error("Login error:", error);
      setApiMessageType("error");
      setApiMessage("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXP_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
    setIsAuthenticated(false);
    setCurrentStep(1);
    setCurrentView("accueil");
    setUserProfile(null);
    setUserInformations([]);
    setFilteredInformations([]);
    setAuthorizedInformations([]);
    setFilteredAuthorized([]);
    setAllUsers([]);
    setFilteredUsers([]);
    setAllInformations([]);
    setLoginData({ email: "", password: "" });
    setInfoData({
      type_bu: "",
      type_info: "",
      laboratoire: "",
      produit: "",
      comment: "",
    });
    setApiMessage("");
    setMobileMenuOpen(false);
    setMobileUserDropdownOpen(false);
    setSearchTerm("");
    setAuthorizedSearch("");
    setUserSearchTerm("");
    setAuthorizedFilters({
      type_info: "",
      type_bu: "",
      date: "",
      from: "",
      to: "",
    });
    setFilteredProducts([]);
    // Reset pagination
    setAuthorizedCurrentPage(1);
    setInformationsCurrentPage(1);
    setUsersCurrentPage(1);
    setAllInfoCurrentPage(1);
  };

  // ---------- SUBMIT INFORMATION ----------
  const submitInfo = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setApiMessageType("error");
      setApiMessage("Session expirée. Veuillez vous reconnecter.");
      setTimeout(() => logout(), 2000);
      return;
    }

    // Validation based on information type
    if (!infoData.type_bu || !infoData.type_info) {
      setApiMessageType("error");
      setApiMessage("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // For "Vos recommandations", only comment is required
    if (infoData.type_info === "Vos recommandations") {
      if (!infoData.comment.trim()) {
        setApiMessageType("error");
        setApiMessage("Veuillez saisir votre recommandation");
        return;
      }
    } else {
      // For other types, laboratoire is required
      if (!infoData.laboratoire.trim()) {
        setApiMessageType("error");
        setApiMessage("Le champ Laboratoire est obligatoire");
        return;
      }
    }

    setIsLoading(true);
    setApiMessage("");

    try {
      const currentDateTime = new Date().toISOString();
      const payload = {
        ...infoData,
        info_date: currentDateTime,
      };

      const res = await fetch(`${API_URL}/informations/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setApiMessageType("success");

        setCurrentStep(5);

        setInfoData({
          type_bu: "",
          type_info: "",
          laboratoire: "",
          produit: "",
          comment: "",
        });
        setFilteredProducts([]);

        if (currentView === "mes-informations") {
          fetchUserInformations();
        }
      } else {
        setApiMessageType("error");
        setApiMessage(data.error || "Erreur lors de la soumission");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setApiMessageType("error");
      setApiMessage("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBUSelect = (bu: string) => {
    setInfoData((prev) => ({ ...prev, type_bu: bu }));
    setCurrentStep(3);
    setMobileMenuOpen(false);
  };

  const handleInfoTypeSelect = (type: string) => {
    if (type === "Vos recommandations") {
      // Clear lab and product fields for recommendations
      setInfoData((prev) => ({
        ...prev,
        type_info: type,
        laboratoire: "",
        produit: "",
      }));
    } else {
      setInfoData((prev) => ({ ...prev, type_info: type }));
    }
    setCurrentStep(4);
    setMobileMenuOpen(false);
  };

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    submitInfo();
  };

  const resetForm = () => {
    setCurrentStep(2);
    setInfoData({
      type_bu: "",
      type_info: "",
      laboratoire: "",
      produit: "",
      comment: "",
    });
    setFilteredProducts([]);
    setApiMessage("");
    setMobileMenuOpen(false);
  };

  const goBack = () => {
    if (currentStep > 2 && currentView === "accueil") {
      setCurrentStep(currentStep - 1);
    }
    setMobileMenuOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const viewComment = (comment: string) => {
    setSelectedComment(comment);
    setShowCommentModal(true);
  };

  const applyFilters = () => {
    fetchAllInformations();
  };

  const clearFilters = () => {
    setFilters({
      date: "",
      from: "",
      to: "",
      type_bu: "",
      type_info: "",
      user_id: "",
    });
    fetchAllInformations();
  };

  const applyAuthorizedFilters = () => {
    fetchAuthorizedView();
  };

  const clearAuthorizedFilters = () => {
    setAuthorizedFilters({
      type_info: "",
      type_bu: "",
      date: "",
      from: "",
      to: "",
    });
    fetchAuthorizedView();
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      A: "bg-purple-100 text-purple-800",
      D: "bg-blue-100 text-blue-800",
      R: "bg-gray-100 text-gray-800",
    };
    const labels = {
      A: "Admin",
      D: "Délégué",
      R: "Responsable",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]}`}
      >
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  // Check if user has ALL view
  const hasAllView = () => {
    return (
      userProfile?.view?.toUpperCase() === "ALL" ||
      userProfile?.view?.toUpperCase().includes("ALL")
    );
  };

  // Handle role change in new user form
  const handleNewUserRoleChange = (role: "A" | "D" | "R") => {
    setNewUser({
      ...newUser,
      role,
      view: role === "R" ? "" : "", // Clear view when not role R
    });
  };

  // Handle role change in edit user form
  const handleEditingUserRoleChange = (role: "A" | "D" | "R") => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        role,
        view: role === "R" ? editingUser.view : "", // Clear view when not role R
      });
    }
  };

  // Get label for view value
  const getViewLabel = (viewValue: string) => {
    const option = VIEW_OPTIONS.find((opt) => opt.value === viewValue);
    return option ? option.label : viewValue;
  };

  // Render User Management
  const renderUserManagement = () => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = getCurrentUsersItems();

    return (
      <div className="space-y-6">
        {/* Add User Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Ajouter un utilisateur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code utilisateur (Mot de passe)
              </label>
              <input
                type="text"
                value={newUser.user_code}
                onChange={(e) =>
                  setNewUser({ ...newUser, user_code: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="CODE123"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ce code servira également de mot de passe pour la connexion
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  handleNewUserRoleChange(e.target.value as "A" | "D" | "R")
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="D">Délégué</option>
                <option value="A">Administrateur</option>
                <option value="R">Responsable (Lecture seule)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vue autorisée{" "}
                {newUser.role === "R" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              {newUser.role === "R" ? (
                <select
                  value={newUser.view}
                  onChange={(e) =>
                    setNewUser({ ...newUser, view: e.target.value })
                  }
                  required={newUser.role === "R"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez une vue</option>
                  {VIEW_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Non applicable pour les rôles{" "}
                  {newUser.role === "A" ? "Administrateur" : "Délégué"}
                </div>
              )}
              {newUser.role === "R" && (
                <p className="text-xs text-gray-500 mt-2">
                  Sélectionnez la ou les BU que cet utilisateur peut voir
                </p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={createUser}
              disabled={isLoading || (newUser.role === "R" && !newUser.view)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Création..." : "Créer utilisateur"}
            </button>
            {newUser.role === "R" && !newUser.view && (
              <p className="text-sm text-red-500 mt-3">
                Veuillez sélectionner une vue pour le rôle Responsable
              </p>
            )}
          </div>
        </div>

        {/* Users List with Search */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Liste des utilisateurs ({filteredUsers.length})
            </h2>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par email, code, rôle..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
              {userSearchTerm && (
                <button
                  onClick={() => setUserSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Code
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Rôle
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Vue autorisée
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Date création
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 border-b">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.user_code}
                    </td>
                    <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.role === "R" ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.view?.includes("ALL") ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                        >
                          {getViewLabel(user.view || "") || "Non définie"}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={user.id === userProfile?.user_id}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {userSearchTerm
                    ? "Aucun utilisateur trouvé pour votre recherche"
                    : "Aucun utilisateur trouvé"}
                </p>
                {userSearchTerm && (
                  <button
                    onClick={() => setUserSearchTerm("")}
                    className="mt-4 text-blue-600 hover:text-blue-800 underline"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <Pagination
              currentPage={usersCurrentPage}
              totalPages={totalPages}
              onPageChange={setUsersCurrentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>

        {/* Edit User Modal - New design with blur background */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700">
                  Modifier utilisateur
                </h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                    {editingUser.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      handleEditingUserRoleChange(
                        e.target.value as "A" | "D" | "R",
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="D">Délégué</option>
                    <option value="A">Administrateur</option>
                    <option value="R">Responsable (Lecture seule)</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vue autorisée{" "}
                    {editingUser.role === "R" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  {editingUser.role === "R" ? (
                    <select
                      value={editingUser.view || ""}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, view: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionnez une vue</option>
                      {VIEW_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                      Non applicable pour les rôles{" "}
                      {editingUser.role === "A" ? "Administrateur" : "Délégué"}
                    </div>
                  )}
                  {editingUser.role === "R" && (
                    <p className="text-xs text-gray-500 mt-2">
                      Sélectionnez la ou les BU que cet utilisateur peut voir
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => updateUser(editingUser)}
                    disabled={
                      isLoading ||
                      (editingUser.role === "R" && !editingUser.view)
                    }
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? "Mise à jour..." : "Mettre à jour"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render All Informations
  const renderAllInformations = () => {
    const totalPages = Math.ceil(allInformations.length / itemsPerPage);
    const currentInfo = getCurrentAllInfoItems();

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-3">
            <Filter className="w-5 h-5" />
            Filtres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date spécifique
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Du
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Au
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BU
              </label>
              <select
                value={filters.type_bu}
                onChange={(e) =>
                  setFilters({ ...filters, type_bu: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les BU</option>
                <option value="CVS">CVS</option>
                <option value="CNS">CNS</option>
                <option value="PUR">PUR</option>
                <option value="HOSP">HOSP</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'information
              </label>
              <select
                value={filters.type_info}
                onChange={(e) =>
                  setFilters({ ...filters, type_info: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="Produit concurrent">Produit concurrent</option>
                <option value="Activités médicales">Activités médicales</option>
                <option value="Événements & campagnes">
                  Événements & campagnes
                </option>
                <option value="Veille commerciale">Veille commerciale</option>
                <option value="Vos recommandations">Vos recommandations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisateur
              </label>
              <select
                value={filters.user_id}
                onChange={(e) =>
                  setFilters({ ...filters, user_id: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les utilisateurs</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={applyFilters}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-3"
            >
              <Filter className="w-4 h-4" />
              Appliquer les filtres
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Effacer tout
            </button>
          </div>
        </div>

        {/* Informations Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Toutes les informations ({allInformations.length})
            </h2>
            <button
              onClick={() => {
                // Export functionality
                const csv = allInformations.map((info) => ({
                  Date: formatDate(info.created_at),
                  Utilisateur: info.users?.email || "Inconnu",
                  BU: info.type_bu,
                  Type: info.type_info,
                  Laboratoire: info.laboratoire,
                  "Produit concurrent": info.produit_concurent || "",
                  Commentaire: info.comment || "",
                }));

                const csvContent = [
                  Object.keys(csv[0] || {}).join(","),
                  ...csv.map((row) => Object.values(row).join(",")),
                ].join("\n");

                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `informations_${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Utilisateur
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    BU
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Laboratoire
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Produit
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Commentaire
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentInfo.map((info) => (
                  <tr key={info.id} className="hover:bg-gray-50 border-b">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatDate(info.created_at)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {info.users?.email || "Inconnu"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {info.type_bu}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {info.type_info}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {info.laboratoire}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {info.produit_concurent || "-"}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {info.comment ? (
                        <button
                          onClick={() => viewComment(info.comment)}
                          className="text-blue-600 hover:text-blue-800 transition-colors hover:bg-blue-50 px-3 py-1 rounded-lg"
                        >
                          Voir
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {allInformations.length > itemsPerPage && (
            <Pagination
              currentPage={allInfoCurrentPage}
              totalPages={totalPages}
              onPageChange={setAllInfoCurrentPage}
              totalItems={allInformations.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>
    );
  };

  // Render Authorized View for Role R
  const renderAuthorizedView = () => {
    const isAllView = hasAllView();
    const totalPages = Math.ceil(filteredAuthorized.length / itemsPerPage);
    const currentAuthorizedItems = getCurrentAuthorizedItems();

    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-700">
                Vue Autorisée
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isAllView
                  ? "Accès complet à toutes les informations"
                  : "Accès limité aux informations selon vos autorisations"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg">
                {filteredAuthorized.length} information(s) trouvée(s)
              </div>
              <button
                onClick={exportAuthorizedToCSV}
                disabled={filteredAuthorized.length === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
            </div>
          </div>

          {/* Filters for Role R */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-3">
              <Filter className="w-5 h-5" />
              Filtres
            </h2>
            <div
              className={`grid grid-cols-1 ${isAllView ? "md:grid-cols-5" : "md:grid-cols-4"} gap-6`}
            >
              {isAllView && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BU
                  </label>
                  <select
                    value={authorizedFilters.type_bu}
                    onChange={(e) =>
                      setAuthorizedFilters({
                        ...authorizedFilters,
                        type_bu: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes les BU</option>
                    <option value="CVS">CVS</option>
                    <option value="CNS">CNS</option>
                    <option value="PUR">PUR</option>
                    <option value="HOSP">HOSP</option>
                    <option value="COMMERCIAL">COMMERCIAL</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'information
                </label>
                <select
                  value={authorizedFilters.type_info}
                  onChange={(e) =>
                    setAuthorizedFilters({
                      ...authorizedFilters,
                      type_info: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les types</option>
                  <option value="Produit concurrent">Produit concurrent</option>
                  <option value="Activités médicales">
                    Activités médicales
                  </option>
                  <option value="Événements & campagnes">
                    Événements & campagnes
                  </option>
                  <option value="Veille commerciale">Veille commerciale</option>
                  <option value="Vos recommandations">
                    Vos recommandations
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date spécifique
                </label>
                <input
                  type="date"
                  value={authorizedFilters.date}
                  onChange={(e) =>
                    setAuthorizedFilters({
                      ...authorizedFilters,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Du
                </label>
                <input
                  type="date"
                  value={authorizedFilters.from}
                  onChange={(e) =>
                    setAuthorizedFilters({
                      ...authorizedFilters,
                      from: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Au
                </label>
                <input
                  type="date"
                  value={authorizedFilters.to}
                  onChange={(e) =>
                    setAuthorizedFilters({
                      ...authorizedFilters,
                      to: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={applyAuthorizedFilters}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-3"
              >
                <Filter className="w-4 h-4" />
                Appliquer les filtres
              </button>
              <button
                onClick={clearAuthorizedFilters}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Effacer tout
              </button>
            </div>
          </div>

          {apiMessage && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                apiMessageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {apiMessage}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par utilisateur, laboratoire, produit, BU, type..."
                value={authorizedSearch}
                onChange={(e) => setAuthorizedSearch(e.target.value)}
                className="pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>

          {authorizedLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Chargement des informations...
              </p>
            </div>
          ) : filteredAuthorized.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {authorizedSearch ||
                authorizedFilters.type_bu ||
                authorizedFilters.type_info
                  ? "Aucune information trouvée pour vos critères de recherche"
                  : "Aucune information disponible pour le moment"}
              </p>
              {(authorizedSearch ||
                authorizedFilters.type_bu ||
                authorizedFilters.type_info) && (
                <button
                  onClick={() => {
                    setAuthorizedSearch("");
                    clearAuthorizedFilters();
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                  Effacer tous les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Date
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Utilisateur
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        BU
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Type
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Laboratoire
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Produit concurrent
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Commentaire
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAuthorizedItems.map((info) => (
                      <tr key={info.id} className="hover:bg-gray-50 border-b">
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(info.created_at)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {info.users?.email || "Inconnu"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {info.type_bu}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {info.type_info}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {info.laboratoire}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {info.produit_concurent || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {info.comment ? (
                            <button
                              onClick={() => viewComment(info.comment)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors hover:bg-blue-50 px-3 py-1 rounded-lg"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Voir</span>
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredAuthorized.length > itemsPerPage && (
                <Pagination
                  currentPage={authorizedCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setAuthorizedCurrentPage}
                  totalItems={filteredAuthorized.length}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Render Mobile Bottom Navigation
  const renderMobileBottomNavigation = () => {
    if (!isAuthenticated) return null;

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
        <div className="flex">
          {/* Show different navigation based on role */}
          {userProfile?.role === "R" ? (
            // Navigation for Role R
            <button
              onClick={() => {
                setCurrentView("vue-autorisee");
                setMobileMenuOpen(false);
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                currentView === "vue-autorisee"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {hasAllView() ? (
                <Globe className="w-6 h-6" />
              ) : (
                <EyeIcon className="w-6 h-6" />
              )}
              <span className="text-xs font-medium">Vue Autorisée</span>
            </button>
          ) : (
            // Navigation for Role D and A
            <>
              <button
                onClick={() => {
                  setCurrentView("accueil");
                  if (currentStep === 5) setCurrentStep(2);
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                  currentView === "accueil"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Accueil</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView("mes-informations");
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                  currentView === "mes-informations"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <History className="w-6 h-6" />
                <span className="text-xs font-medium">Mes infos</span>
              </button>
              {userProfile?.role === "A" && (
                <>
                  <button
                    onClick={() => {
                      setCurrentView("gestion-utilisateurs");
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                      currentView === "gestion-utilisateurs"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-xs font-medium">Utilisateurs</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView("toutes-informations");
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                      currentView === "toutes-informations"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-xs font-medium">Toutes infos</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-blue-100 relative overflow-hidden pb-20 md:pb-0">
      {/* Background decorative icons */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Heart className="absolute top-20 right-32 w-16 h-16 text-red-400" />
        <Brain className="absolute top-40 right-20 w-12 h-12 text-purple-400" />
        <FlaskConical className="absolute bottom-32 left-1/3 w-14 h-14 text-green-400" />
        <Building2 className="absolute top-1/3 right-1/4 w-20 h-20 text-blue-400" />
        <Briefcase className="absolute bottom-1/4 right-1/3 w-16 h-16 text-orange-400" />
        <Heart className="absolute bottom-20 left-1/4 w-12 h-12 text-pink-400" />
        <Brain className="absolute top-1/2 left-20 w-16 h-16 text-purple-300" />
      </div>

      {/* Login Page */}
      {!isAuthenticated ? (
        <div className="mx-auto max-w-md pt-8 md:pt-16 px-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            {/* Updated Logo Section */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <svg
                width="60"
                height="60"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:w-16 sm:h-16"
              >
                <g transform="rotate(-30 60 60)">
                  <rect
                    x="25"
                    y="40"
                    width="70"
                    height="30"
                    rx="15"
                    fill="#4F7CFF"
                  />
                  <rect
                    x="25"
                    y="40"
                    width="35"
                    height="30"
                    rx="15"
                    fill="#16A34A"
                  />{" "}
                  {/* green-600 */}
                </g>
                <circle
                  cx="70"
                  cy="65"
                  r="20"
                  fill="white"
                  stroke="#4F7CFF"
                  strokeWidth="5"
                />
                <line
                  x1="82"
                  y1="78"
                  x2="98"
                  y2="94"
                  stroke="#4F7CFF"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M58 65 L65 65 L68 58 L72 72 L75 65 L82 65"
                  stroke="#4F7CFF"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-col items-start">
                <span className="text-2xl sm:text-3xl font-bold">
                  <span className="text-gray-700">Pharma</span>
                  <span className="text-green-600">View</span>
                </span>
                <span className="text-gray-500 text-xs sm:text-sm">
                  Veille concurrentielle pharmaceutique
                </span>
              </div>
            </div>

            <h1 className="text-center text-gray-700 text-2xl mb-8">
              Connexion
            </h1>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-gray-700 mb-2 text-sm">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm">
                  Code utilisateur
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Code utilisateur"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {apiMessage && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  apiMessageType === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {apiMessage}
              </div>
            )}

            <button
              onClick={login}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            <div className="text-center text-sm text-gray-500 mt-6">
              🔒 Connexion sécurisée
            </div>
          </div>
        </div>
      ) : (
        /* Main Layout with Sidebar for authenticated users */
        <div className="flex h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex flex-col w-64 bg-white/50 backdrop-blur-sm min-h-screen shadow-lg">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {userProfile?.initial}
                  </div>
                  {userProfile?.role === "A" && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {userProfile?.role === "R" && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center shadow-sm">
                      <EyeIcon className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-700">
                    {userProfile?.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {userProfile?.email}
                  </div>
                  {userProfile?.view && userProfile?.role === "R" && (
                    <div className="text-xs text-gray-600 mt-1">
                      {hasAllView() ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Vue: TOUTES LES BU
                        </span>
                      ) : (
                        `Vue: ${userProfile.view
                          .split(",")
                          .map((v) => getViewLabel(v))
                          .join(", ")}`
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {userProfile?.role === "A" && (
                  <>
                    <button
                      onClick={() => {
                        setCurrentView("gestion-utilisateurs");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentView === "gestion-utilisateurs"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-white/50"
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      <span>Gestion des utilisateurs</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView("toutes-informations");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentView === "toutes-informations"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-white/50"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Toutes les informations</span>
                    </button>
                  </>
                )}

                {/* Different navigation based on role */}
                {userProfile?.role === "R" ? (
                  // Navigation for Role R (Read-only)
                  <>
                    <button
                      onClick={() => {
                        setCurrentView("vue-autorisee");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentView === "vue-autorisee"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-white/50"
                      }`}
                    >
                      {hasAllView() ? (
                        <Globe className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                      <span>Vue Autorisée</span>
                    </button>
                  </>
                ) : (
                  // Navigation for Role D and A
                  <>
                    <button
                      onClick={() => {
                        setCurrentView("accueil");
                        if (currentStep === 5) setCurrentStep(2);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentView === "accueil"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-white/50"
                      }`}
                    >
                      <Home className="w-5 h-5" />
                      <span>Accueil</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView("mes-informations");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentView === "mes-informations"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-white/50"
                      }`}
                    >
                      <History className="w-5 h-5" />
                      <span>Mes Informations</span>
                    </button>
                  </>
                )}
              </nav>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <>
              {/* Mobile Header */}
              <header className="bg-white/70 backdrop-blur-sm shadow-sm px-3 py-2 relative z-30 md:hidden">
                <div className="flex items-center justify-between w-full">
                  {/* Logo + PharmaView */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-12 h-12 sm:w-14 sm:h-14"
                      >
                        <g transform="rotate(-30 60 60)">
                          <rect
                            x="25"
                            y="40"
                            width="70"
                            height="30"
                            rx="15"
                            fill="#4F7CFF"
                          />
                          <rect
                            x="25"
                            y="40"
                            width="35"
                            height="30"
                            rx="15"
                            fill="#16A34A"
                          />{" "}
                          {/* green-600 */}
                        </g>
                        <circle
                          cx="70"
                          cy="65"
                          r="20"
                          fill="white"
                          stroke="#4F7CFF"
                          strokeWidth="5"
                        />
                        <line
                          x1="82"
                          y1="78"
                          x2="98"
                          y2="94"
                          stroke="#4F7CFF"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M58 65 L65 65 L68 58 L72 72 L75 65 L82 65"
                          stroke="#4F7CFF"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-gray-700">
                      Pharma<span className="text-green-600">View</span>
                    </span>
                  </div>

                  {/* Mobile user dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() =>
                        setMobileUserDropdownOpen(!mobileUserDropdownOpen)
                      }
                      className="flex items-center gap-2 sm:gap-3 focus:outline-none"
                    >
                      <div className="flex flex-col items-end text-right">
                        <div className="text-sm sm:text-base font-semibold text-gray-700">
                          {userProfile?.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">
                          {userProfile?.email.split("@")[0]}
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
                        {userProfile?.initial}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform ${mobileUserDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {mobileUserDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="font-medium text-gray-700">
                            {userProfile?.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {userProfile?.email}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setMobileUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Se déconnecter
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {/* Desktop Header */}
              <header className="bg-white/70 backdrop-blur-sm shadow-sm px-4 py-3 sm:px-6 sm:py-4 relative z-30 hidden md:flex flex-col items-center justify-center">
                {/* Logo and Title */}
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="flex-shrink-0">
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="sm:w-16 sm:h-16 md:w-20 md:h-20"
                    >
                      <g transform="rotate(-30 60 60)">
                        <rect
                          x="25"
                          y="40"
                          width="70"
                          height="30"
                          rx="15"
                          fill="#4F7CFF"
                        />
                        <rect
                          x="25"
                          y="40"
                          width="35"
                          height="30"
                          rx="15"
                          fill="#5EC57E"
                        />{" "}
                        {/* green-500 */}
                      </g>
                      <circle
                        cx="70"
                        cy="65"
                        r="20"
                        fill="white"
                        stroke="#4F7CFF"
                        strokeWidth="5"
                      />
                      <line
                        x1="82"
                        y1="78"
                        x2="98"
                        y2="94"
                        stroke="#4F7CFF"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M58 65 L65 65 L68 58 L72 72 L75 65 L82 65"
                        stroke="#4F7CFF"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-700">
                      Pharma<span className="text-green-600">View</span>
                    </span>

                    <span className="text-gray-500 text-xs sm:text-sm md:text-base hidden sm:inline text-center">
                      Veille concurrentielle pharmaceutique
                    </span>
                  </div>
                </div>
              </header>
            </>

            {/* Mobile menu (old style - keeping for reference but not used in new design) */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white/90 backdrop-blur-sm z-20">
                <div className="px-4 py-3 space-y-3">
                  {/* User profile in mobile menu */}
                  {userProfile && (
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {userProfile.initial}
                        </div>
                        {userProfile.role === "A" && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <Shield className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {userProfile.role === "R" && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                            <EyeIcon className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">
                          {userProfile.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {userProfile.email}
                        </div>
                        {userProfile.view && userProfile.role === "R" && (
                          <div className="text-xs text-gray-600 mt-1">
                            {hasAllView() ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Vue: TOUTES LES BU
                              </span>
                            ) : (
                              `Vue: ${userProfile.view
                                .split(",")
                                .map((v) => getViewLabel(v))
                                .join(", ")}`
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {currentView === "accueil" ? (
                /* Accueil View - Information Submission Flow */
                <>
                  {/* Step 2: BU Selection */}
                  {currentStep === 2 && (
                    <div className="flex items-center justify-center p-4 md:p-6">
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-700 text-center mb-6 md:mb-8">
                          Cette information concerne quelle BU ?
                        </h1>

                        <div className="space-y-3 md:space-y-4">
                          {/* CVS Button */}
                          <button
                            onClick={() => handleBUSelect("CVS")}
                            className="w-full flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-xl hover:from-red-500 hover:to-pink-500 transition-all shadow-md hover:shadow-lg group"
                          >
                            <div className="flex items-center gap-3">
                              <Heart className="w-5 h-5 md:w-6 md:h-6" />
                              <span className="text-base md:text-lg font-semibold">
                                CVS
                              </span>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* CNS Button */}
                          <button
                            onClick={() => handleBUSelect("CNS")}
                            className="w-full flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl hover:from-purple-500 hover:to-purple-600 transition-all shadow-md hover:shadow-lg group"
                          >
                            <div className="flex items-center gap-3">
                              <Brain className="w-5 h-5 md:w-6 md:h-6" />
                              <span className="text-base md:text-lg font-semibold">
                                CNS
                              </span>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* PUR Button */}
                          <button
                            onClick={() => handleBUSelect("PUR")}
                            className="w-full flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all shadow-md hover:shadow-lg group"
                          >
                            <div className="flex items-center gap-3">
                              <FlaskConical className="w-5 h-5 md:w-6 md:h-6" />
                              <span className="text-base md:text-lg font-semibold">
                                PUR
                              </span>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* HOSP Button */}
                          <button
                            onClick={() => handleBUSelect("HOSP")}
                            className="w-full flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-md hover:shadow-lg group"
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className="w-5 h-5 md:w-6 md:h-6" />
                              <span className="text-base md:text-lg font-semibold">
                                HOSP
                              </span>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* COMMERCIAL Button */}
                          <button
                            onClick={() => handleBUSelect("COMMERCIAL")}
                            className="w-full flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl hover:from-orange-500 hover:to-orange-600 transition-all shadow-md hover:shadow-lg group"
                            >
                            <div className="flex items-center gap-3">
                              <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
                              <span className="text-base md:text-lg font-semibold">
                                COMMERCIAL
                              </span>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Information Type */}
                  {currentStep === 3 && (
                    <div className="mx-auto max-w-md px-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <button
                            onClick={goBack}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            aria-label="Retour"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
                            Type d'information
                          </h1>
                        </div>

                        <p className="text-gray-500 text-center mb-6 md:mb-8">
                          BU sélectionnée:{" "}
                          <span className="font-semibold text-blue-600">
                            {infoData.type_bu}
                          </span>
                        </p>

                        <div className="space-y-3 md:space-y-4">
                          {[
                            {
                              type: "Produit concurrent",
                              icon: FileText,
                              gradient: "from-blue-400 to-blue-500",
                              hover: "from-blue-500 to-blue-600",
                            },
                            {
                              type: "Activités médicales",
                              icon: Activity,
                              gradient: "from-green-400 to-green-500",
                              hover: "from-green-500 to-green-600",
                            },
                            {
                              type: "Événements & campagnes",
                              icon: Calendar,
                              gradient: "from-yellow-400 to-yellow-500",
                              hover: "from-yellow-500 to-yellow-600",
                            },
                            {
                              type: "Veille commerciale",
                              icon: Eye,
                              gradient: "from-red-400 to-red-500",
                              hover: "from-red-500 to-red-600",
                            },
                            {
                              type: "Vos recommandations",
                              icon: Sparkles,
                              gradient: "from-purple-400 to-purple-500",
                              hover: "from-purple-500 to-purple-600",
                            },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.type}
                                onClick={() => handleInfoTypeSelect(item.type)}
                                className={`w-full flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 bg-gradient-to-r ${item.gradient} text-white rounded-xl hover:${item.hover} transition-all shadow-md hover:shadow-lg group`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                  <span className="text-base md:text-lg font-semibold">
                                    {item.type}
                                  </span>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Form with Labs Autocomplete */}
                  {currentStep === 4 && (
                    <div className="mx-auto max-w-2xl px-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <button
                            onClick={goBack}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            aria-label="Retour"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
                            Soumettre une information
                          </h1>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                              <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                BU Sélectionnée
                              </label>
                              <div className="px-4 py-3.5 text-sm md:text-base bg-gray-50 border border-gray-300 rounded-lg">
                                {infoData.type_bu || "Non sélectionné"}
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Type d'information
                              </label>
                              <div className="px-4 py-3.5 text-sm md:text-base bg-gray-50 border border-gray-300 rounded-lg">
                                {infoData.type_info || "Non sélectionné"}
                              </div>
                            </div>
                          </div>

                          {/* Laboratoire field with autocomplete - Only show for non-recommendation types */}
                          {infoData.type_info !== "Vos recommandations" && (
                            <div>
                              <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Laboratoire{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative" ref={labDropdownRef}>
                                <input
                                  ref={labInputRef}
                                  id="laboratoire"
                                  type="text"
                                  placeholder="Rechercher ou saisir un laboratoire"
                                  value={infoData.laboratoire}
                                  onChange={handleInfoChange}
                                  onFocus={() => setShowLabDropdown(true)}
                                  required={
                                    infoData.type_info !== "Vos recommandations"
                                  }
                                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />

                                {/* Labs Dropdown */}
                                {showLabDropdown && filteredLabs.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {filteredLabs.map((lab) => (
                                      <button
                                        key={lab.lab}
                                        type="button"
                                        onClick={() => selectLab(lab.lab)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                      >
                                        <div className="font-medium text-gray-800">
                                          {lab.lab}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {lab.products.slice(0, 3).join(", ")}
                                          {lab.products.length > 3 && "..."}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Ce champ est obligatoire
                              </p>
                              {infoData.laboratoire &&
                                labsData.some(
                                  (lab) => lab.lab === infoData.laboratoire,
                                )}
                            </div>
                          )}

                          {/* Product field with autocomplete based on selected lab - Only show for non-recommendation types */}
                          {infoData.type_info !== "Vos recommandations" && (
                            <div>
                              <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Produit concurrent (optionnel)
                              </label>
                              <div
                                className="relative"
                                ref={productDropdownRef}
                              >
                                <input
                                  ref={productInputRef}
                                  id="produit"
                                  type="text"
                                  placeholder={
                                    infoData.laboratoire
                                      ? `Rechercher un produit de ${infoData.laboratoire}`
                                      : "Sélectionnez d'abord un laboratoire"
                                  }
                                  value={infoData.produit}
                                  onChange={handleInfoChange}
                                  onFocus={() => {
                                    if (infoData.laboratoire) {
                                      setShowProductDropdown(true);
                                    }
                                  }}
                                  disabled={!infoData.laboratoire}
                                  className={`w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    !infoData.laboratoire
                                      ? "bg-gray-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                />

                                {infoData.laboratoire &&
                                  filteredProducts.length > 0}

                                {/* Product Dropdown */}
                                {showProductDropdown &&
                                  infoData.laboratoire &&
                                  filteredProducts.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                      {filteredProducts
                                        .slice(0, 10)
                                        .map((product) => (
                                          <button
                                            key={product}
                                            type="button"
                                            onClick={() =>
                                              selectProduct(product)
                                            }
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                          >
                                            <div className="font-medium text-gray-800 flex items-center gap-2">
                                              {product}
                                              {product
                                                .toLowerCase()
                                                .includes(
                                                  infoData.produit.toLowerCase(),
                                                ) &&
                                                infoData.produit && (
                                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    Correspondance
                                                  </span>
                                                )}
                                            </div>
                                          </button>
                                        ))}
                                      {filteredProducts.length > 10 && (
                                        <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-100">
                                          {filteredProducts.length - 10} autres
                                          produits correspondants
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                              {infoData.laboratoire &&
                                filteredProducts.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    {filteredProducts.length} produit(s)
                                    correspondant(s)
                                  </p>
                                )}
                            </div>
                          )}

                          <div>
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                              {infoData.type_info === "Vos recommandations" ? (
                                <>
                                  Votre recommandation{" "}
                                  <span className="text-red-500">*</span>
                                </>
                              ) : (
                                "Commentaire"
                              )}
                            </label>
                            <textarea
                              id="comment"
                              placeholder={
                                infoData.type_info === "Vos recommandations"
                                  ? "Saisissez votre recommandation ici..."
                                  : "Commentaire"
                              }
                              value={infoData.comment}
                              onChange={handleInfoChange}
                              required={
                                infoData.type_info === "Vos recommandations"
                              }
                              className="w-full px-4 py-3.5 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 md:h-40 resize-none"
                            />
                          </div>

                          {apiMessage && (
                            <div
                              className={`p-4 rounded-lg ${
                                apiMessageType === "success"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {apiMessage}
                            </div>
                          )}

                          <div className="flex gap-4 pt-4">
                            <button
                              type="button"
                              onClick={goBack}
                              className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                            >
                              Retour
                            </button>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm md:text-base"
                            >
                              {isLoading ? (
                                "Envoi en cours..."
                              ) : (
                                <>
                                  <Send className="w-5 h-5" />
                                  <span>Soumettre l'information</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Confirmation */}
                  {currentStep === 5 && (
                    <div className="flex items-center justify-center p-4 md:p-6">
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
                        <div className="flex flex-col items-center justify-center text-center py-8">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                            <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                          </div>

                          <h1 className="text-xl md:text-2xl font-semibold text-gray-700 mb-3 md:mb-4">
                            Information envoyée
                          </h1>

                          <p className="text-gray-500 text-base md:text-lg mb-6 md:mb-8">
                            Votre information a été envoyée avec succès !
                          </p>

                          <div className="w-full">
                            <button
                              onClick={() => {
                                setCurrentStep(2);
                                setApiMessage("");
                              }}
                              className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3.5 rounded-lg hover:from-green-500 hover:to-green-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                            >
                              <FileText className="w-5 h-5" />
                              <span className="text-sm md:text-base">
                                Nouvelle information
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : currentView === "mes-informations" ? (
                /* Mes Informations View for D users */
                <div className="max-w-7xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
                      <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
                        Mes Informations
                      </h1>

                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="relative w-full sm:w-auto">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                          />
                        </div>

                        <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                          {filteredInformations.length} information(s)
                          trouvée(s)
                        </div>
                      </div>
                    </div>

                    {apiMessage && (
                      <div
                        className={`mb-6 p-4 rounded-lg ${
                          apiMessageType === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {apiMessage}
                      </div>
                    )}

                    {informationsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                          Chargement des informations...
                        </p>
                      </div>
                    ) : filteredInformations.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          {searchTerm
                            ? "Aucune information trouvée pour votre recherche"
                            : "Aucune information soumise pour le moment"}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="mt-4 text-blue-600 hover:text-blue-800 underline"
                          >
                            Effacer la recherche
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCurrentView("accueil");
                            setCurrentStep(2);
                          }}
                          className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Soumettre une information
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto -mx-4 md:mx-0">
                          <table className="w-full min-w-full">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 border-b">
                                  Date
                                </th>
                                <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 border-b">
                                  BU
                                </th>
                                <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 border-b">
                                  Type
                                </th>
                                <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 border-b">
                                  Laboratoire
                                </th>
                                <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 border-b">
                                  Produit concurrent
                                </th>
                                <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 border-b">
                                  Commentaire
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getCurrentInformationsItems().map((info) => (
                                <tr
                                  key={info.id}
                                  className="hover:bg-gray-50 border-b"
                                >
                                  <td className="py-3 px-4 md:px-6 text-xs md:text-sm text-gray-600">
                                    {formatDate(info.created_at)}
                                  </td>
                                  <td className="py-3 px-4 md:px-6">
                                    <span className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {info.type_bu}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 md:px-6 text-xs md:text-sm text-gray-700">
                                    {info.type_info}
                                    {info.type_info ===
                                      "Vos recommandations" && (
                                      <Sparkles className="w-3 h-3 inline ml-1 text-purple-500" />
                                    )}
                                  </td>
                                  <td className="py-3 px-4 md:px-6 text-xs md:text-sm text-gray-700">
                                    {info.laboratoire || "-"}
                                  </td>
                                  <td className="py-3 px-4 md:px-6 text-xs md:text-sm text-gray-700">
                                    {info.produit_concurent || "-"}
                                  </td>
                                  <td className="py-3 px-4 md:px-6 text-xs md:text-sm text-gray-700">
                                    {info.comment ? (
                                      <button
                                        onClick={() =>
                                          viewComment(info.comment)
                                        }
                                        className="flex items-center gap-1 md:gap-2 text-blue-600 hover:text-blue-800 transition-colors hover:bg-blue-50 px-2 py-1 md:px-3 md:py-1 rounded-lg"
                                      >
                                        <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-xs md:text-sm">
                                          Voir
                                        </span>
                                      </button>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {filteredInformations.length > itemsPerPage && (
                          <Pagination
                            currentPage={informationsCurrentPage}
                            totalPages={Math.ceil(
                              filteredInformations.length / itemsPerPage,
                            )}
                            onPageChange={setInformationsCurrentPage}
                            totalItems={filteredInformations.length}
                            itemsPerPage={itemsPerPage}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : currentView === "gestion-utilisateurs" ? (
                /* User Management View */
                <div className="max-w-7xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
                      <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
                        Gestion des utilisateurs
                      </h1>
                      <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg">
                        {filteredUsers.length} utilisateur(s)
                      </div>
                    </div>

                    {apiMessage && (
                      <div
                        className={`mb-6 p-4 rounded-lg ${
                          apiMessageType === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {apiMessage}
                      </div>
                    )}

                    {renderUserManagement()}
                  </div>
                </div>
              ) : currentView === "toutes-informations" ? (
                /* All Informations View */
                <div className="max-w-7xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
                      <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
                        Toutes les informations
                      </h1>
                      <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg">
                        {allInformations.length} information(s)
                      </div>
                    </div>

                    {apiMessage && (
                      <div
                        className={`mb-6 p-4 rounded-lg ${
                          apiMessageType === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {apiMessage}
                      </div>
                    )}

                    {renderAllInformations()}
                  </div>
                </div>
              ) : currentView === "vue-autorisee" ? (
                /* Authorized View for Role R */
                renderAuthorizedView()
              ) : null}
            </main>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {renderMobileBottomNavigation()}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                Commentaire
              </h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedComment}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCommentModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}