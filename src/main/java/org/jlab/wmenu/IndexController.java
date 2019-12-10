package org.jlab.wmenu;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author ryans
 */
@WebServlet(name = "IndexController", urlPatterns = {"/index"})
public class IndexController extends HttpServlet {

    public static final String JMENU_URL;
    public static final String SEARCH_URL;
    public static final String ROOT_MENU;
    
    static {
        String prop = System.getenv("WMENU_JMENU_URL");
        
        if(prop == null) {
            prop = "/apps/jmenu/api/menus";
        }
        
        JMENU_URL = prop;
        
        prop = System.getenv("WMENU_SEARCH_URL");
        
        if(prop == null) {
            prop = "/search/jmenu-cebaf";
        }
        
        SEARCH_URL = prop;    
        
        prop = System.getenv("WMENU_ROOT_MENU");
        
        if(prop == null) {
            prop = "MainMenu";
        }
        
        ROOT_MENU = prop;
    }    
    
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        request.setAttribute("menuUrl", JMENU_URL);
        request.setAttribute("searchUrl", SEARCH_URL);
        request.setAttribute("rootMenu", ROOT_MENU);
        
        request.getRequestDispatcher("/WEB-INF/views/index.jsp").forward(request, response);
    }
}
