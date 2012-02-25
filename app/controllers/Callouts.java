package controllers;

import play.mvc.Controller;

/**
 * Simple controller to render "call-out" template
 * as specified by the content type definition.
 * Might be a external call-out as well in future releases.
 *
 * @author Niko Schmuck
 * @since 20.02.2012
 */
public class Callouts extends Controller {
    
    public static void get(String name) {
        renderTemplate("Callouts/" + name + ".html");
    }
    
}
