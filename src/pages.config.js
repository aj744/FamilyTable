import ContextDiagram from './pages/ContextDiagram';
import CookingMode from './pages/CookingMode';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import MealView from './pages/MealView';
import Meals from './pages/Meals';
import RecipeEditor from './pages/RecipeEditor';
import RecipeView from './pages/RecipeView';
import Search from './pages/Search';
import UnitConverter from './pages/UnitConverter';
import Tests from './pages/Tests';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ContextDiagram": ContextDiagram,
    "CookingMode": CookingMode,
    "Dashboard": Dashboard,
    "Home": Home,
    "MealView": MealView,
    "Meals": Meals,
    "RecipeEditor": RecipeEditor,
    "RecipeView": RecipeView,
    "Search": Search,
    "UnitConverter": UnitConverter,
    "Tests": Tests,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};